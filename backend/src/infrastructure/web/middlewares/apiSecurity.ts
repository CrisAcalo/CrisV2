import { randomUUID } from 'node:crypto';
import { RequestHandler } from 'express';

const sensitivePrefixes = ['/api/auth', '/api/admin', '/api/messages'];
const auditableResources = new Set(['auth', 'admin', 'messages', 'projects', 'experiences', 'educations', 'certificates', 'skills']);

export const apiSecurity: RequestHandler = (req, res, next) => {
    const requestId = randomUUID();
    res.set({
        'X-Request-ID': requestId,
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'no-referrer',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    });
    res.vary('Origin');

    const path = req.path.toLowerCase().replace(/\/{2,}/g, '/');
    const resource = path.split('/')[2];
    const isLogin = path === '/api/auth/login' && req.method === 'POST';
    if (path.startsWith('/api/') && auditableResources.has(resource) && ['POST', 'PATCH', 'DELETE'].includes(req.method)) {
        res.once('finish', () => {
            if (!isLogin && req.user?.role !== 'ADMIN') return;
            console.info(JSON.stringify({
                event: isLogin ? 'login' : 'admin_write',
                requestId,
                resource,
                method: req.method,
                status: res.statusCode,
                ...(req.user ? { actorId: req.user.userId } : {}),
            }));
        });
    }

    if (path === '/api' || path.startsWith('/api/')) {
        res.set('Content-Security-Policy', "default-src 'none'; base-uri 'none'; frame-ancestors 'none'");
        res.vary('Authorization');
        if (req.headers.authorization !== undefined
            || (req.method !== 'GET' && req.method !== 'HEAD')
            || sensitivePrefixes.some(prefix => path === prefix || path.startsWith(prefix + '/'))) {
            res.set('Cache-Control', 'private, no-store');
        }
    }

    next();
};
