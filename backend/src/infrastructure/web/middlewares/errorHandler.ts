import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../../../domain/errors/AppError';

const bodyErrors = {
    'entity.parse.failed': { status: 400, message: 'Invalid JSON body' },
    'entity.too.large': { status: 413, message: 'Request body too large' },
    'encoding.unsupported': { status: 415, message: 'Unsupported request encoding' },
    'charset.unsupported': { status: 415, message: 'Unsupported request charset' },
    'request.aborted': { status: 400, message: 'Request interrupted' },
    'request.size.invalid': { status: 400, message: 'Invalid request size' },
} as const;

export const errorHandler: ErrorRequestHandler = (err: unknown, _req, res, next) => {
    if (res.headersSent) {
        next(new Error('Response interrupted'));
        return;
    }

    res.set('Cache-Control', 'private, no-store');
    const requestId = res.get('X-Request-ID');

    const type = err && typeof err === 'object' && 'type' in err ? err.type : null;
    if (typeof type === 'string' && Object.hasOwn(bodyErrors, type)) {
        const { status, message } = bodyErrors[type as keyof typeof bodyErrors];
        res.status(status).json({ status: 'error', message, requestId });
        return;
    }

    if (err instanceof ZodError) {
        res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            errors: err.issues.map((e) => ({
                path: e.path.join('.'),
                message: e.message
            }))
        });
        return;
    }

    if (err instanceof AppError && err.isOperational && err.statusCode >= 400 && err.statusCode < 500) {
        res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
            ...('code' in err && typeof err.code === 'string' ? { code: err.code } : {}),
        });
        return;
    }

    if (err instanceof Error && err.name === 'PrismaClientKnownRequestError') {
        if ('code' in err && err.code === 'P2002') {
            res.status(409).json({
                status: 'error',
                message: 'A record with that value already exists.',
            });
            return;
        }
    }

    // Error objects may carry credentials, headers, or the request body.
    console.error('[API] Unhandled error', { requestId, status: 500 });
    res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        requestId,
    });
};
