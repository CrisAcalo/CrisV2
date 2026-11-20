const { test, before, after } = require('node:test');
const { randomUUID } = require('node:crypto');
const assert = require('node:assert/strict');

const db = new URL(process.env.SECURITY_TEST_DATABASE_URL ?? 'http://invalid');
assert.ok(db.protocol === 'postgresql:' &&
    ['127.0.0.1', 'localhost', '[::1]'].includes(db.hostname) && /_test$/.test(db.pathname),
    'Use SECURITY_TEST_DATABASE_URL with a dedicated local _test database');

const simulatedResend = process.env.SECURITY_TEST_RESEND_URL
    ? new URL(process.env.SECURITY_TEST_RESEND_URL) : null;
if (simulatedResend) {
    assert.ok(simulatedResend.protocol === 'http:' && simulatedResend.hostname === '127.0.0.1',
        'The provider simulation must be local');
}

Object.assign(process.env, {
    NODE_ENV: 'production',
    ALLOWED_ORIGINS: 'https://portfolio.example.test',
    TRUST_PROXY_HOPS: '0',
    DATABASE_URL: db.href,
    ADMIN_MFA_REQUIRED: 'false',
    ADMIN_MFA_SECRETS: '',
    CONTACT_EMAIL_DAILY_LIMIT: '2',
    PUBLIC_SITE_ORIGIN: 'https://portfolio.example.test',
    RESEND_API_KEY: 're_test_only',
    RESEND_FROM: 'contacto@example.test',
    MAIL_TO: 'owner@example.test',
});

const axios = require('axios');
const { hash } = require('bcrypt');
const { prisma } = require('../dist/infrastructure/database/prisma/client');
const { SyncLinkedInDataUseCase } = require('../dist/application/use-cases/SyncLinkedInDataUseCase');
const app = require('../dist/app').default;

const marker = randomUUID();
const credentials = { email: `security-${marker}@example.test`, password: 'fixture-password-9000' };
const names = ['Public', 'Private', 'Archived'].map(kind => `${kind} ${marker}`);
const validContact = {
    senderName: `Visitor ${marker}`,
    senderEmail: 'visitor@example.test',
    subject: 'Question from visitor',
    content: 'Private text that belongs only in the dashboard',
};
let server;
let origin;
let bearer;
let experience;
let education;

async function request(path, options = {}) {
    return fetch(`${origin}${path}`, options);
}

before(async () => {
    const { id: publicId } = await prisma.skill.create({
        data: { name: names[0], normalizedName: `public${marker}`, isPublic: true },
    });
    const { id: privateId } = await prisma.skill.create({
        data: { name: names[1], normalizedName: `private${marker}`, isPublic: false },
    });
    const { id: archivedId } = await prisma.skill.create({
        data: { name: names[2], normalizedName: `archived${marker}`, isPublic: true, deletedAt: new Date() },
    });
    const skills = { create: [publicId, privateId, archivedId].map(skillId => ({ skillId })) };
    const startDate = new Date('2025-01-01T00:00:00Z');
    experience = await prisma.experience.create({
        data: { role: marker, company: 'Fixture', startDate, skills },
    });
    education = await prisma.education.create({
        data: { degree: marker, institution: 'Fixture', startDate, skills },
    });
    await prisma.user.create({
        data: { email: credentials.email, passwordHash: await hash(credentials.password, 10), role: 'ADMIN' },
    });

    server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    origin = `http://127.0.0.1:${server.address().port}`;

    const login = await request('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials),
    });
    assert.equal(login.status, 200);
    const { data } = await login.json();
    bearer = { Authorization: `Bearer ${data.token}` };
});

after(async () => {
    try {
        if (server) await new Promise(resolve => server.close(resolve));
        await prisma.experience.deleteMany({ where: { role: marker } });
        await prisma.education.deleteMany({ where: { degree: marker } });
        await prisma.skill.deleteMany({ where: { name: { in: names } } });
        await prisma.user.deleteMany({ where: { email: credentials.email } });
        await prisma.message.deleteMany({ where: { senderName: validContact.senderName } });
        await prisma.contactEmailBudget.deleteMany({ where: { id: 'portfolio' } });
    } finally {
        await prisma.$disconnect();
    }
});

test('API uses configured browser origins and omits development documentation in production', async () => {
    const allowed = await request('/api/messages', {
        method: 'OPTIONS',
        headers: {
            Origin: 'https://portfolio.example.test',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'content-type',
        },
    });
    assert.equal(allowed.status, 204);
    assert.equal(allowed.headers.get('access-control-allow-origin'), 'https://portfolio.example.test');
    const denied = await request('/api/health', { headers: { Origin: 'https://unlisted.example.test' } });
    assert.equal(denied.headers.get('access-control-allow-origin'), null);
    assert.match(denied.headers.get('vary'), /\bOrigin\b/);
    assert.equal(denied.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(denied.headers.get('x-powered-by'), null);
    assert.equal((await request('/api-docs/')).status, 404);
});

test('public history omits private and archived skills while authenticated admin keeps each association', async () => {
    for (const [route, record] of [['experiences', experience], ['educations', education]]) {
        for (const path of [`/api/${route}`, `/api/${route}/${record.id}`]) {
            const publicResult = await request(path);
            const adminResult = await request(path, { headers: bearer });
            assert.equal(publicResult.status, 200);
            assert.equal(adminResult.status, 200);
            const readRecord = ({ data }) => Array.isArray(data) ? data.find(row => row.id === record.id) : data;
            const publicSkills = readRecord(await publicResult.json()).skills;
            assert.deepEqual(publicSkills.map(skill => skill.name), [names[0]]);
            assert.deepEqual(Object.keys(publicSkills[0]).sort(), ['id', 'name']);
            const adminSkills = readRecord(await adminResult.json()).skills;
            assert.deepEqual(adminSkills.map(skill => skill.name).sort(), [...names].sort());
            assert.equal(adminResult.headers.get('cache-control'), 'private, no-store');
            assert.match(publicResult.headers.get('vary'), /\bAuthorization\b/);
        }
    }
});

test('malformed or oversized bodies receive safe responses without echoing or logging input', async () => {
    const credential = 'fixture-sentinel-credential';
    const consoleError = console.error;
    const errors = [];
    console.error = (...args) => errors.push(args);
    try {
        const malformed = await request('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: '{"password":"' + credential,
        });
        assert.equal(malformed.status, 400);
        assert.equal(malformed.headers.get('cache-control'), 'private, no-store');
        const parsed = await malformed.json();
        assert.equal(parsed.requestId, malformed.headers.get('x-request-id'));
        assert.ok(!JSON.stringify(parsed).includes(credential));
        const oversized = await request('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: credential.repeat(1000) }),
        });
        assert.equal(oversized.status, 413);
        assert.ok(!(await oversized.text()).includes(credential));
        const compressed = await request('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Content-Encoding': 'gzip' },
            body: require('node:zlib').gzipSync(Buffer.from(JSON.stringify({ password: credential }))),
        });
        assert.equal(compressed.status, 415);
        assert.ok(!JSON.stringify(errors).includes(credential));
    } finally {
        console.error = consoleError;
    }
});

test('daily Resend budget limits provider calls while allowing messages to be saved privately', async () => {
    await prisma.contactEmailBudget.deleteMany({ where: { id: 'portfolio' } });
    const originalPost = axios.post;
    const payloads = [];
    axios.post = async (url, payload, options) => {
        assert.equal(url, 'https://api.resend.com/emails');
        assert.equal(options.maxRedirects, 0);
        payloads.push(payload);
        return simulatedResend
            ? axios.request({ ...options, method: 'POST', url: simulatedResend.href, data: payload, proxy: false })
            : { status: 200, data: { id: 'fake-id' } };
    };
    try {
        const sendMessage = () => request('/api/messages', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(validContact),
        });
        const responses = await Promise.all([sendMessage(), sendMessage(), sendMessage()]);
        const receipts = await Promise.all(responses.map(async response => {
            assert.equal(response.status, 201);
            assert.equal(response.headers.get('cache-control'), 'private, no-store');
            return response.json();
        }));
        assert.deepEqual(receipts.map(receipt => receipt.notification).sort(), ['accepted', 'accepted', 'disabled']);
        for (const receipt of receipts) assert.deepEqual(Object.keys(receipt.data), ['id']);
        assert.equal(await prisma.message.count({ where: { senderName: validContact.senderName } }), 3);
        assert.equal(payloads.length, 2);
        for (const payload of payloads) {
            assert.match(payload.text, /https:\/\/portfolio\.example\.test\/admin\/messages/);
            assert.equal(payload.reply_to, undefined);
            for (const value of Object.values(validContact)) assert.ok(!JSON.stringify(payload).includes(value));
        }
    } finally {
        axios.post = originalPost;
    }
});

test('a complete LinkedIn response with no records preserves imported records', async () => {
    const service = {
        fetchExperiences: async () => [], mapExperiences: () => [],
        fetchEducations: async () => [], mapEducations: () => [],
        fetchCertificates: async () => [], mapCertificates: () => [],
    };
    const repository = {
        upsertExperiences: () => assert.fail('Should not replace experiences'),
        upsertEducation: () => assert.fail('Should not replace education'),
        upsertCertificates: () => assert.fail('Should not replace certificates'),
    };
    const sync = new SyncLinkedInDataUseCase(service, repository, {
        getConfig: async () => ({ linkedInUrn: 'fixture-urn' }),
    });
    const results = await Promise.all([
        sync.executeExperiences(), sync.executeEducations(), sync.executeCertificates(),
    ]);
    for (const result of results) {
        assert.equal(result.count, 0);
        assert.match(result.message, /conservaron los registros actuales/);
    }
});
