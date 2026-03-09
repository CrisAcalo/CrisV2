import { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { User } from '../../../domain/entities';
import { prisma } from './client';

export class PrismaUserRepository implements IUserRepository {
    async findById(id: string): Promise<User | null> {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) return null;
        return user as User;
    }

    async findByEmail(email: string): Promise<User | null> {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        return user as User;
    }

    async save(user: User): Promise<User> {
        const saved = await prisma.user.create({
            data: {
                id: user.id,
                email: user.email,
                passwordHash: user.passwordHash,
                role: user.role,
            }
        });
        return saved as User;
    }

    async update(id: string, data: Partial<User>): Promise<User> {
        const updated = await prisma.user.update({
            where: { id },
            data: {
                email: data.email,
                passwordHash: data.passwordHash,
                role: data.role,
            }
        });
        return updated as User;
    }
}
