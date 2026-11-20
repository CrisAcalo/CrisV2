import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

export const seedUsers = async (prisma: PrismaClient) => {
    const email = process.env.SEED_ADMIN_EMAIL;
    const password = process.env.SEED_ADMIN_PASSWORD;
    if (!email || !password || password.length < 12 || password === 'admin123') {
        throw new Error('Set SEED_ADMIN_EMAIL and a unique SEED_ADMIN_PASSWORD of at least 12 characters');
    }

    await prisma.user.create({
        data: { email, passwordHash: await bcrypt.hash(password, 12), role: 'ADMIN' },
    });
    console.log(`✅ Administrador local creado: ${email}`);
};
