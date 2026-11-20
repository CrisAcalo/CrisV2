import { createHash, randomBytes } from 'node:crypto';
import type { User } from '../../domain/entities';
import { UnauthorizedError } from '../../domain/errors/AppError';
import { env } from '../../config/env';
import { getAdminMfaSecret } from '../../config/mfa';
import { totpStepForCode } from '../../utils/totp';
import { prisma } from '../database/prisma/client';

type SessionCredentials = { token: string; expiresAt: Date };

const fingerprint = (value: string | Buffer) => createHash('sha256').update(value).digest('hex');

function mfaFor(user: { role: string; email: string }) {
    const secret = user.role === 'ADMIN' ? getAdminMfaSecret(user.email) : undefined;
    return {
        secret,
        enrolled: user.role !== 'ADMIN' || !env.ADMIN_MFA_REQUIRED || Boolean(secret),
        fingerprint: secret ? fingerprint(secret) : null,
    };
}

export async function issueAuthSession(user: User, otp?: string): Promise<SessionCredentials> {
    const mfa = mfaFor(user);
    const now = new Date();
    let step: bigint | null = null;

    if (!mfa.enrolled) {
        throw new UnauthorizedError('La cuenta requiere configurar autenticación de dos factores', 'MFA_NOT_CONFIGURED');
    }
    if (mfa.secret) {
        if (!otp) throw new UnauthorizedError('Ingresa el código de autenticación', 'MFA_REQUIRED');
        step = totpStepForCode(mfa.secret, otp, now.getTime());
        if (step === null) throw new UnauthorizedError('Código inválido o vencido', 'MFA_INVALID');
    }

    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date(now.getTime() + env.AUTH_SESSION_TTL_MINUTES * 60_000);
    await prisma.$transaction(async (tx) => {
        // Serialize issuance with password, role, enrollment replay and account-state changes.
        const [lockedUser] = await tx.$queryRaw<Array<{ lastTotpStep: bigint | null }>>`
            SELECT "lastTotpStep" FROM "User"
            WHERE "id" = ${user.id} AND "passwordHash" = ${user.passwordHash}
                AND "role"::text = ${user.role} AND "email" = ${user.email}
                AND "deletedAt" IS NULL
            FOR UPDATE
        `;
        if (!lockedUser) throw new UnauthorizedError('Invalid credentials');
        if (step !== null) {
            if (lockedUser.lastTotpStep !== null && step <= lockedUser.lastTotpStep) {
                throw new UnauthorizedError('Código inválido o vencido', 'MFA_INVALID');
            }
            await tx.user.update({ where: { id: user.id }, data: { lastTotpStep: step } });
        }

        await tx.authSession.deleteMany({ where: { userId: user.id, expiresAt: { lte: now } } });
        await tx.authSession.create({
            data: {
                tokenHash: fingerprint(token),
                userId: user.id,
                role: user.role,
                passwordFingerprint: fingerprint(user.passwordHash),
                mfaFingerprint: mfa.fingerprint,
                expiresAt,
            },
        });
    });
    return { token, expiresAt };
}

export async function resolveAuthSession(token: string) {
    const tokenHash = fingerprint(token);
    const session = await prisma.authSession.findUnique({
        where: { tokenHash },
        include: { user: { select: { id: true, email: true, role: true, deletedAt: true, passwordHash: true } } },
    });
    if (!session || session.expiresAt <= new Date() || session.user.deletedAt ||
        session.role !== session.user.role || session.passwordFingerprint !== fingerprint(session.user.passwordHash)) {
        throw new UnauthorizedError('Invalid or expired session');
    }
    const mfa = mfaFor(session.user);
    if (!mfa.enrolled || session.mfaFingerprint !== mfa.fingerprint) {
        throw new UnauthorizedError('Session has been revoked');
    }

    const { id, email, role } = session.user;
    return { userId: id, email, role, tokenHash };
}

export async function revokeAuthSession(tokenHash: string): Promise<void> {
    await prisma.authSession.deleteMany({ where: { tokenHash } });
}
