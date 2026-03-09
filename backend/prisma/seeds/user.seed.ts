import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

export const seedUsers = async (prisma: PrismaClient) => {
    const adminPassword = await bcrypt.hash('admin123', 10);
    const testPassword = await bcrypt.hash('testuser123', 10);

    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@portfolio.com' },
        update: {},
        create: {
            email: 'admin@portfolio.com',
            passwordHash: adminPassword,
            role: 'ADMIN',
        },
    });

    const basicUser = await prisma.user.upsert({
        where: { email: 'guest@portfolio.com' },
        update: {},
        create: {
            email: 'guest@portfolio.com',
            passwordHash: testPassword,
            role: 'BASIC',
        },
    });

    console.log(`✅ Usuarios creados: ${adminUser.email}, ${basicUser.email}`);
};
