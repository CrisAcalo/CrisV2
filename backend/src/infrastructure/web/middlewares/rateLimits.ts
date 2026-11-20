import { rateLimit } from 'express-rate-limit';

export const loginRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    identifier: 'login-ip',
    skipSuccessfulRequests: true,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { status: 'error', message: 'Too many login attempts. Try again later.' },
});

export const contactRateLimit = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { status: 'error', message: 'Too many messages. Try again later.' },
});
