require('dotenv').config({ quiet: true });
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { createHash, createHmac, randomUUID } = require('node:crypto');
const bcrypt = require('bcrypt');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

if (process.env.CONFIRM_LOCAL_DB_TESTS !== 'yes' ||
    !['localhost', '127.0.0.1', '[::1]'].includes(new URL(process.env.DATABASE_URL ?? 'postgresql://invalid.example').hostname)) {
    throw new Error('Integration tests require CONFIRM_LOCAL_DB_TESTS=yes and a loopback DATABASE_URL for an isolated database');
}

const fixture = randomUUID();
const email = `audit-${fixture}@example.test`;
const mfaEmail = `audit-mfa-${fixture}@example.test`;
const password = 'local-integration-password-123';
process.env.ADMIN_MFA_REQUIRED = 'false';
process.env.ADMIN_MFA_SECRETS = JSON.stringify({ [mfaEmail]: 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ' });
const app = require('../dist/app').default;
const { PrismaLinkedInSyncRepository } = require('../dist/infrastructure/database/prisma/PrismaLinkedInSyncRepository');
const { LinkedInService } = require('../dist/infrastructure/services/LinkedInService');
const { env } = require('../dist/config/env');
const { loginRateLimit } = require('../dist/infrastructure/web/middlewares/rateLimits');

const prisma = new PrismaClient();
let server;
let baseUrl;
let token;
let userId;
let originalPasswordHash;
let publishedId;
let draftId;

async function request(path, options = {}) {
    const response = await fetch(`${baseUrl}${path}`, options);
    const body = response.status === 204 ? null : await response.json();
    return { status: response.status, body, headers: response.headers };
}

function loginUser(identity = email, secret = password, otp) {
    return request('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identity, password: secret, otp }),
    });
}

function authenticate(session = token) {
    return { headers: { Authorization: `Bearer ${session}` } };
}

before(async () => {
    const user = await prisma.user.create({
        data: { email, passwordHash: await bcrypt.hash(password, 10), role: 'ADMIN' },
    });
    userId = user.id;
    originalPasswordHash = user.passwordHash;
    await prisma.user.create({ data: { email: mfaEmail, passwordHash: originalPasswordHash, role: 'ADMIN' } });
    const publicSkill = await prisma.skill.create({
        data: { name: `Public ${fixture}`, normalizedName: `public${fixture}`, isPublic: true },
    });
    const privateSkill = await prisma.skill.create({
        data: { name: `Private ${fixture}`, normalizedName: `private${fixture}`, isPublic: false },
    });
    const published = await prisma.project.create({
        data: {
            title: `Published ${fixture}`, description: 'Published project', isPublished: true,
            skills: { create: [{ skillId: publicSkill.id }, { skillId: privateSkill.id }] },
        },
    });
    const draft = await prisma.project.create({
        data: {
            title: `Draft ${fixture}`, description: 'Draft project', isPublished: false,
            skills: { create: [{ skillId: publicSkill.id }] },
        },
    });
    publishedId = published.id;
    draftId = draft.id;
    await new Promise(resolve => { server = app.listen(0, '127.0.0.1', resolve); });
    baseUrl = `http://127.0.0.1:${server.address().port}`;
    const login = await loginUser();
    assert.equal(login.status, 200);
    token = login.body.data.token;
});

after(async () => {
    if (server) await new Promise(resolve => server.close(resolve));
    await prisma.project.deleteMany({ where: { title: { contains: fixture } } });
    await prisma.skill.deleteMany({ where: { name: { contains: fixture } } });
    await prisma.user.deleteMany({ where: { email: { in: [email, mfaEmail] } } });
    await prisma.$disconnect();
});

test('anonymous registration cannot create an administrator', async () => {
    const result = await request('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'attacker@example.test', password, role: 'ADMIN' }),
    });
    assert.equal(result.status, 401);
});

test('public project responses hide drafts and private skills', async () => {
    const list = await request('/api/projects');
    assert.equal(list.status, 200);
    assert.ok(list.body.data.some(project => project.id === publishedId));
    assert.ok(!list.body.data.some(project => project.id === draftId));
    const published = list.body.data.find(project => project.id === publishedId);
    assert.equal(published.skills.length, 1);
    assert.equal((await request(`/api/projects/${draftId}`)).status, 404);

    const adminList = await request('/api/projects', { headers: { Authorization: `Bearer ${token}` } });
    assert.ok(adminList.body.data.some(project => project.id === draftId));
    assert.equal(adminList.body.data.find(project => project.id === publishedId).skills.length, 2);
});

test('public skills hide private skills and draft relations', async () => {
    const list = await request('/api/skills');
    assert.ok(!list.body.data.some(skill => skill.name === `Private ${fixture}`));
    const publicSkill = list.body.data.find(skill => skill.name === `Public ${fixture}`);
    assert.equal(publicSkill.projects.length, 1);
    assert.equal(publicSkill.projects[0].id, publishedId);
});

test('trash requires administrator access', async () => {
    assert.equal((await request('/api/projects?deleted=true')).status, 403);
    assert.equal((await request('/api/projects?deleted=true', {
        headers: { Authorization: `Bearer ${token}` },
    })).status, 200);
});

test('a role change permanently revokes previously issued sessions', async () => {
    const previous = token;
    await prisma.user.update({ where: { id: userId }, data: { role: 'BASIC' } });
    try {
        const result = await request('/api/projects?deleted=true', {
            headers: { Authorization: `Bearer ${token}` },
        });
        assert.equal(result.status, 401);
    } finally {
        await prisma.user.update({ where: { id: userId }, data: { role: 'ADMIN' } });
    }
    assert.equal((await request('/api/auth/me', authenticate(previous))).status, 401);
    const login = await loginUser();
    assert.equal(login.status, 200);
    token = login.body.data.token;
});

test('password rotation revokes existing tokens immediately', async () => {
    const previous = token;
    await prisma.user.update({
        where: { id: userId }, data: { passwordHash: await bcrypt.hash('another-local-password-456', 10) },
    });
    try {
        const result = await request('/api/projects?deleted=true', {
            headers: { Authorization: `Bearer ${token}` },
        });
        assert.equal(result.status, 401);
    } finally {
        await prisma.user.update({ where: { id: userId }, data: { passwordHash: originalPasswordHash } });
    }
    assert.equal((await request('/api/auth/me', authenticate(previous))).status, 401);
    const login = await loginUser();
    assert.equal(login.status, 200);
    token = login.body.data.token;
});

test('session credentials are hashed in storage, expire and revoke at logout', async () => {
    const login = await loginUser();
    assert.equal(login.status, 200);
    assert.match(login.headers.get('cache-control') ?? '', /no-store/);
    const { user, token: session, expiresAt } = login.body.data;
    assert.deepEqual(user, { id: userId, email, role: 'ADMIN' });
    assert.ok(Date.parse(expiresAt) > Date.now());
    const tokenHash = createHash('sha256').update(session).digest('hex');
    assert.ok(await prisma.authSession.findUnique({ where: { tokenHash } }));
    assert.equal(await prisma.authSession.findUnique({ where: { tokenHash: session } }), null);
    assert.equal((await request('/api/auth/me', authenticate(session))).status, 200);
    assert.equal((await request('/api/auth/logout', { ...authenticate(session), method: 'POST' })).status, 204);
    assert.equal((await request('/api/auth/me', authenticate(session))).status, 401);

    const expired = (await loginUser()).body.data.token;
    await prisma.authSession.update({
        where: { tokenHash: createHash('sha256').update(expired).digest('hex') },
        data: { expiresAt: new Date(0) },
    });
    assert.equal((await request('/api/auth/me', authenticate(expired))).status, 401);
});

test('MFA requires correct password and a fresh authenticator code', async () => {
    const badPassword = await loginUser(mfaEmail, 'wrong');
    assert.equal(badPassword.status, 401);
    assert.equal(badPassword.body.code, undefined);
    const challenge = await loginUser(mfaEmail);
    assert.equal(challenge.status, 401);
    assert.equal(challenge.body.code, 'MFA_REQUIRED');
    assert.equal(challenge.body.data, undefined);

    // Independent generation for the fixture's RFC 6238 text key.
    const counter = Buffer.alloc(8);
    counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30_000)));
    const mac = createHmac('sha1', '12345678901234567890').update(counter).digest();
    const otp = ((mac.readUInt32BE(mac.at(-1) & 15) & 0x7fffffff) % 1_000_000).toString().padStart(6, '0');
    const results = await Promise.all([loginUser(mfaEmail, password, otp), loginUser(mfaEmail, password, otp)]);
    assert.deepEqual(results.map(result => result.status).sort(), [200, 401]);
    assert.equal(results.find(result => result.status === 401).body.code, 'MFA_INVALID');
});

test('enforcing MFA rejects sessions and logins for an unenrolled administrator', async () => {
    env.ADMIN_MFA_REQUIRED = true;
    try {
        const login = await loginUser();
        assert.equal(login.status, 401);
        assert.equal(login.body.code, 'MFA_NOT_CONFIGURED');
        assert.equal((await request('/api/auth/me', authenticate())).status, 401);
    } finally {
        env.ADMIN_MFA_REQUIRED = false;
    }
});

test('validated project creation drops unexpected fields', async () => {
    const injectedId = randomUUID();
    const result = await request('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: `Injected ${fixture}`, description: 'Test', isPublished: false, id: injectedId }),
    });
    assert.equal(result.status, 201);
    assert.notEqual(result.body.data.id, injectedId);
});

test('failed LinkedIn replacement retains existing imported certificates', async () => {
    const certificate = await prisma.certificate.create({
        data: { name: `Imported ${fixture}`, issuingOrganization: 'Audit', issueDate: new Date(), isImportedFromLinkedIn: true },
    });
    const repository = new PrismaLinkedInSyncRepository();
    await assert.rejects(repository.upsertCertificates([{
        name: 'Invalid', issuingOrganization: 'Audit', issueDate: new Date('invalid'),
        isImportedFromLinkedIn: true,
    }]));
    assert.ok(await prisma.certificate.findUnique({ where: { id: certificate.id } }));
    await prisma.certificate.delete({ where: { id: certificate.id } });
});

test('LinkedIn pagination fetches every page before returning data', async () => {
    const originalGet = axios.get;
    const originalToken = env.LINKEDIN_API_TOKEN;
    const pages = [];
    env.LINKEDIN_API_TOKEN = 'local-test-key';
    axios.get = async (_url, options) => {
        pages.push(options.params.page);
        return { status: 200, data: { success: true, data: [{ title: `Item ${options.params.page}` }], has_more: options.params.page === 1 } };
    };
    try {
        const items = await new LinkedInService().fetchExperiences('test-urn');
        assert.deepEqual(pages, [1, 2]);
        assert.equal(items.length, 2);
    } finally {
        axios.get = originalGet;
        env.LINKEDIN_API_TOKEN = originalToken;
    }
});

test('LinkedIn incomplete responses do not become empty successful syncs', async () => {
    const originalGet = axios.get;
    const originalToken = env.LINKEDIN_API_TOKEN;
    env.LINKEDIN_API_TOKEN = 'local-test-key';
    axios.get = async () => ({ status: 202, data: { success: false, message: 'Processing' } });
    try {
        await assert.rejects(new LinkedInService().fetchExperiences('test-urn'), /no entregó todos los datos de experiencias/);
    } finally {
        axios.get = originalGet;
        env.LINKEDIN_API_TOKEN = originalToken;
    }
});

test('contact validation rejects oversized messages', async () => {
    const result = await request('/api/messages', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            senderName: 'Audit', senderEmail: 'audit@example.test', subject: 'Question',
            content: 'x'.repeat(1001),
        }),
    });
    assert.equal(result.status, 400);
});

test('login rate limit buckets case variants of the same account', async () => {
    loginRateLimit.resetKey('127.0.0.1');
    const account = `not-enrolled-${fixture}@example.test`;
    for (let attempt = 0; attempt < 6; attempt++) {
        const result = await loginUser(attempt % 2 === 0 ? account : account.toUpperCase(), 'wrong');
        assert.equal(result.status, 401);
    }
    assert.equal((await loginUser(account, 'wrong')).status, 429);
    assert.equal((await loginUser(`different-${fixture}@example.test`, 'wrong')).status, 401);
});

test('login IP rate limit blocks repeated attempts across accounts', async () => {
    loginRateLimit.resetKey('127.0.0.1');
    let lastStatus = 0;
    for (let attempt = 0; attempt < 11; attempt++) {
        const result = await loginUser(`nobody-${attempt}-${fixture}@example.test`, 'wrong');
        lastStatus = result.status;
    }
    assert.equal(lastStatus, 429);
});
