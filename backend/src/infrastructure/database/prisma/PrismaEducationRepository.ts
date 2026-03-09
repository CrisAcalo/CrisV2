import { prisma } from './client';
import { IEducationRepository } from '../../../domain/repositories/IEducationRepository';
import { Education } from '../../../domain/entities';

const WITH_SKILLS = {
    include: {
        skills: { include: { skill: { select: { id: true, name: true } } } }
    }
} as const;

function mapEducation(raw: any): Education {
    return {
        ...raw,
        skills: raw.skills?.map((s: any) => ({ id: s.skill.id, name: s.skill.name })) ?? [],
    };
}

export class PrismaEducationRepository implements IEducationRepository {
    async findAll(includeDeleted = false): Promise<Education[]> {
        const rows = await prisma.education.findMany({
            where: { deletedAt: includeDeleted ? { not: null } : null },
            orderBy: { startDate: 'desc' },
            ...WITH_SKILLS,
        });
        return rows.map(mapEducation);
    }

    async findById(id: string): Promise<Education | null> {
        const row = await prisma.education.findFirst({ where: { id, deletedAt: null }, ...WITH_SKILLS });
        return row ? mapEducation(row) : null;
    }

    async create(data: Omit<Education, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'skills'> & { skillIds?: string[] }): Promise<Education> {
        const { skillIds, ...rest } = data as any;
        const row = await prisma.education.create({
            data: {
                ...rest,
                skills: skillIds?.length
                    ? { create: skillIds.map((id: string) => ({ skillId: id })) }
                    : undefined,
            },
            ...WITH_SKILLS,
        });
        return mapEducation(row);
    }

    async update(id: string, data: Partial<Omit<Education, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'skills'>> & { skillIds?: string[] }): Promise<Education | null> {
        const exists = await this.findById(id);
        if (!exists) return null;

        const { skillIds, ...rest } = data as any;
        const row = await prisma.education.update({
            where: { id },
            data: {
                ...rest,
                skills: skillIds !== undefined ? {
                    deleteMany: {},
                    create: skillIds.map((sid: string) => ({ skillId: sid })),
                } : undefined,
            },
            ...WITH_SKILLS,
        });
        return mapEducation(row);
    }

    async delete(id: string): Promise<boolean> {
        const exists = await prisma.education.findUnique({ where: { id } });
        if (!exists) return false;
        await prisma.education.delete({ where: { id } });
        return true;
    }

    async softDelete(id: string): Promise<boolean> {
        const exists = await this.findById(id);
        if (!exists) return false;
        await prisma.education.update({ where: { id }, data: { deletedAt: new Date() } });
        return true;
    }

    async restore(id: string): Promise<boolean> {
        const exists = await prisma.education.findUnique({ where: { id } });
        if (!exists) return false;
        await prisma.education.update({ where: { id }, data: { deletedAt: null } });
        return true;
    }
}
