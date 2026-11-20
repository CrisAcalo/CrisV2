import 'dotenv/config';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

async function main(): Promise<void> {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_NEW_PASSWORD;
    if (!email || !password || password.length < 12 || password === 'admin123') {
        throw new Error('Set ADMIN_EMAIL and a unique ADMIN_NEW_PASSWORD of at least 12 characters');
    }

    const prisma = new PrismaClient();
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.role !== 'ADMIN' || user.deletedAt) {
            throw new Error('Active administrator not found');
        }
        await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: await bcrypt.hash(password, 12) },
        });
        console.log(`Administrator password changed for ${email}`);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
});
