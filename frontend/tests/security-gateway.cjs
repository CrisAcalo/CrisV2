const assert = require('node:assert/strict');
const { test } = require('node:test');

const fixtureOrigin = new URL(process.env.GATEWAY_TEST_ORIGIN ?? 'http://invalid.example');
assert.ok(process.env.CONFIRM_LOCAL_DB_TESTS === 'yes'
    && fixtureOrigin.protocol === 'http:'
    && ['localhost', '127.0.0.1', '[::1]'].includes(fixtureOrigin.hostname),
'Gateway integration checks require an isolated local test app');

const credentials = {
    email: process.env.GATEWAY_TEST_EMAIL,
    password: process.env.GATEWAY_TEST_PASSWORD,
};
assert.ok(credentials.email && credentials.password, 'Configure synthetic credentials for the isolated test');

const browser = { Origin: fixtureOrigin.origin, 'X-Portfolio-Request': '1' };
const loginHeaders = { ...browser, 'Content-Type': 'application/json' };
const call = (path, options) => fetch(new URL('/api/admin-gateway/' + path, fixtureOrigin), options);

test('gateway checks the origin and revokes a server session on bodyless logout', async () => {
    const anonymous = await call('projects');
    assert.equal(anonymous.status, 401);
    assert.match(anonymous.headers.get('cache-control'), /no-store/);

    const foreign = await call('auth/login', {
        method: 'POST',
        headers: { ...loginHeaders, Origin: 'https://foreign.example.test' },
        body: JSON.stringify(credentials),
    });
    assert.equal(foreign.status, 403);

    const login = await call('auth/login', {
        method: 'POST',
        headers: loginHeaders,
        body: JSON.stringify(credentials),
    });
    assert.equal(login.status, 200);
    const cookie = login.headers.get('set-cookie') ?? '';
    const [sessionCookie, ...cookieAttributes] = cookie.split(';').map((part) => part.trim());
    const attributes = cookieAttributes.map((attribute) => attribute.toLowerCase());
    assert.match(sessionCookie, /^__Host-portfolio-session=/);
    assert.ok(['httponly', 'secure', 'samesite=strict', 'path=/']
        .every((attribute) => attributes.includes(attribute)), 'Expected a secure session cookie');
    assert.ok(!attributes.some((attribute) => attribute.startsWith('domain=')), 'Expected a host-only session cookie');
    const { data: user } = await login.json();
    assert.equal(user.role, 'ADMIN');
    assert.ok(!Object.hasOwn(user, 'token'), 'Bearer token must not appear in the JSON response');
    const cookieHeader = { Cookie: sessionCookie };
    assert.equal((await call('auth/me', { headers: cookieHeader })).status, 200);

    const missingHeader = await call('auth/logout', {
        method: 'POST', headers: { ...cookieHeader, Origin: fixtureOrigin.origin },
    });
    assert.equal(missingHeader.status, 403);

    const logout = await call('auth/logout', { method: 'POST', headers: { ...cookieHeader, ...browser } });
    assert.equal(logout.status, 204);
    assert.ok(logout.headers.get('set-cookie')?.toLowerCase().includes('max-age=0'));
    assert.equal((await call('auth/me', { headers: cookieHeader })).status, 401);
});
