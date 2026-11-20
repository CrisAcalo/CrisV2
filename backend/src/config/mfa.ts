import { z } from 'zod';
import { env } from './env';
import { decodeTotpSecret } from '../utils/totp';

function loadSecrets(): Map<string, Buffer> {
    const secrets = new Map<string, Buffer>();
    if (!env.ADMIN_MFA_SECRETS) return secrets;

    try {
        const record = z.record(z.string(), z.string()).parse(JSON.parse(env.ADMIN_MFA_SECRETS));
        for (const [identity, value] of Object.entries(record)) {
            const email = z.string().email().parse(identity.trim().toLowerCase());
            const secret = decodeTotpSecret(value);
            if (!secret || secrets.has(email)) throw new Error('Invalid MFA enrollment');
            secrets.set(email, secret);
        }
    } catch {
        throw new Error('ADMIN_MFA_SECRETS must be a JSON object with unique email keys and 32-character Base32 secrets');
    }
    return secrets;
}

const secrets = loadSecrets();

export function getAdminMfaSecret(email: string): Buffer | undefined {
    return secrets.get(email.trim().toLowerCase());
}
