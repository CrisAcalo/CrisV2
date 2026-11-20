import { createHmac, timingSafeEqual } from 'node:crypto';

const base32Alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const stepLengthMs = 30_000;

export function decodeTotpSecret(secret: string): Buffer | null {
    const normalized = secret.trim().toUpperCase();
    // A 160-bit, unpadded Base32 key yields exactly 32 characters.
    if (!/^[A-Z2-7]{32}$/.test(normalized)) return null;

    const key = Buffer.alloc(20);
    let bits = 0;
    let pending = 0;
    let byte = 0;
    for (const char of normalized) {
        pending = (pending << 5) | base32Alphabet.indexOf(char);
        bits += 5;
        if (bits >= 8) {
            bits -= 8;
            key[byte++] = pending >> bits;
            pending &= (1 << bits) - 1;
        }
    }
    return key;
}

export function totpStepForCode(secret: Buffer, code: string, now: number): bigint | null {
    if (!/^\d{6}$/.test(code)) return null;

    const expected = Buffer.from(code);
    const current = BigInt(Math.floor(now / stepLengthMs));
    // Prefer the latest matching step so a rare adjacent-code collision cannot be replayed.
    for (const adjustment of [1n, 0n, -1n]) {
        const step = current + adjustment;
        if (step < 0n) continue;

        const counter = Buffer.alloc(8);
        counter.writeBigUInt64BE(step);
        const digest = createHmac('sha1', secret).update(counter).digest();
        const offset = digest[digest.length - 1] & 15;
        const number = (digest.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
        const candidate = Buffer.from(number.toString().padStart(6, '0'));
        if (timingSafeEqual(candidate, expected)) return step;
    }
    return null;
}
