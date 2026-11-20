import './env';

function parseOrigins(configured: string, name = 'ALLOWED_ORIGINS'): string[] {
    return [...new Set(configured.split(',').map(value => {
        try {
            const origin = value.trim();
            const url = new URL(origin);
            if ((url.protocol === 'https:' || url.protocol === 'http:') && origin === url.origin) {
                return url.origin;
            }
        } catch {
            // CORS expects an origin, never a path or a wildcard.
        }
        throw new Error(`${name} must contain HTTP(S) origins without a path`);
    }))];
}

function readInteger(name: string, fallback: number, max: number): number {
    const configured = process.env[name];
    if (configured === undefined) return fallback;

    const value = Number(configured);
    if (!/^\d+$/.test(configured) || !Number.isSafeInteger(value) || value > max) {
        throw new Error(`${name} must be an integer between 0 and ${max}`);
    }
    return value;
}

const production = process.env.NODE_ENV === 'production';
const siteOrigin = 'https://crisacalo.com';
const [publicSiteOrigin, ...extraOrigins] = parseOrigins(process.env.PUBLIC_SITE_ORIGIN ?? siteOrigin, 'PUBLIC_SITE_ORIGIN');
if (!publicSiteOrigin.startsWith('https://') || extraOrigins.length) {
    throw new Error('PUBLIC_SITE_ORIGIN must be a single HTTPS origin');
}

const allowedOrigins = new Set(parseOrigins(process.env.ALLOWED_ORIGINS ?? [
    siteOrigin,
    'https://www.crisacalo.com',
    ...(!production ? [
        'http://localhost:3000', 'http://127.0.0.1:3000',
        'http://localhost:3005', 'http://127.0.0.1:3005',
    ] : []),
].join(',')));

export const security = {
    allowedOrigins,
    trustProxyHops: readInteger('TRUST_PROXY_HOPS', production ? 1 : 0, 8),
    swaggerEnabled: !production,
    contactEmailDailyLimit: readInteger('CONTACT_EMAIL_DAILY_LIMIT', 80, 10_000),
    dashboardUrl: new URL('/admin/messages', publicSiteOrigin).href,
};
