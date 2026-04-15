import { prisma } from './client';
import { IMessageRepository } from '../../../domain/repositories/IMessageRepository';
import { Message } from '../../../domain/entities';

export class PrismaMessageRepository implements IMessageRepository {
    async findAll(includeDeleted: boolean = false): Promise<Message[]> {
        return prisma.message.findMany({
            where: { deletedAt: includeDeleted ? { not: null } : null },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findById(id: string): Promise<Message | null> {
        return prisma.message.findFirst({
            where: { id, deletedAt: null }
        });
    }

    async create(data: Omit<Message, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Message> {
        return prisma.message.create({
            data
        });
    }

    async update(id: string, data: Partial<Omit<Message, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>): Promise<Message | null> {
        const exists = await this.findById(id);
        if (!exists) return null;

        return prisma.message.update({
            where: { id },
            data
        });
    }

    async delete(id: string): Promise<boolean> {
        const exists = await prisma.message.findUnique({ where: { id } });
        if (!exists) return false;

        await prisma.message.delete({
            where: { id }
        });
        return true;
    }

    async softDelete(id: string): Promise<boolean> {
        const exists = await this.findById(id);
        if (!exists) return false;

        await prisma.message.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
        return true;
    }

    async restore(id: string): Promise<boolean> {
        const exists = await prisma.message.findUnique({ where: { id } });
        if (!exists) return false;

        await prisma.message.update({
            where: { id },
            data: { deletedAt: null }
        });
        return true;
    }
}
