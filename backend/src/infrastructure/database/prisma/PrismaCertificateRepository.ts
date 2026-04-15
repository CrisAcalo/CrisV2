import { prisma } from './client';
import { ICertificateRepository } from '../../../domain/repositories/ICertificateRepository';
import { Certificate } from '../../../domain/entities';

export class PrismaCertificateRepository implements ICertificateRepository {
    async findAll(includeDeleted: boolean = false): Promise<Certificate[]> {
        return prisma.certificate.findMany({
            where: { deletedAt: includeDeleted ? { not: null } : null },
            orderBy: { issueDate: 'desc' }
        });
    }

    async findById(id: string): Promise<Certificate | null> {
        return prisma.certificate.findFirst({
            where: { id, deletedAt: null }
        });
    }

    async create(data: Omit<Certificate, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Certificate> {
        return prisma.certificate.create({
            data
        });
    }

    async update(id: string, data: Partial<Omit<Certificate, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>): Promise<Certificate | null> {
        const exists = await this.findById(id);
        if (!exists) return null;

        return prisma.certificate.update({
            where: { id },
            data
        });
    }

    async delete(id: string): Promise<boolean> {
        const exists = await prisma.certificate.findUnique({ where: { id } });
        if (!exists) return false;

        await prisma.certificate.delete({
            where: { id }
        });
        return true;
    }

    async softDelete(id: string): Promise<boolean> {
        const exists = await this.findById(id);
        if (!exists) return false;

        await prisma.certificate.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
        return true;
    }

    async restore(id: string): Promise<boolean> {
        const exists = await prisma.certificate.findUnique({ where: { id } });
        if (!exists) return false;

        await prisma.certificate.update({
            where: { id },
            data: { deletedAt: null }
        });
        return true;
    }
}
