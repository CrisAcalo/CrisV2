import { createHash } from 'node:crypto';
import { rateLimit } from 'express-rate-limit';

// Mounted after validation, independently from the IP limit. Case variants share a bucket.
export const loginAccountLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 6,
    identifier: 'login-account',
    keyGenerator: req => createHash('sha256').update(req.body.email.toLowerCase()).digest('hex'),
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: { status: 'error', message: 'Too many login attempts. Try again later.' },
});
