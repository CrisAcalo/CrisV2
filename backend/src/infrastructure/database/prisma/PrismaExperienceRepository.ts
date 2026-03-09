import { prisma } from './client';
import { IExperienceRepository } from '../../../domain/repositories/IExperienceRepository';
import { Experience } from '../../../domain/entities';

const WITH_SKILLS = {
    include: {
        skills: { include: { skill: { select: { id: true, name: true } } } }
    }
} as const;

function mapExperience(raw: any): Experience {
    return {
        ...raw,
        skills: raw.skills?.map((s: any) => ({ id: s.skill.id, name: s.skill.name })) ?? [],
    };
}

export class PrismaExperienceRepository implements IExperienceRepository {
    async findAll(includeDeleted = false): Promise<Experience[]> {
        const rows = await prisma.experience.findMany({
            where: { deletedAt: includeDeleted ? { not: null } : null },
            orderBy: { startDate: 'desc' },
            ...WITH_SKILLS,
        });
        return rows.map(mapExperience);
    }

    async findById(id: string): Promise<Experience | null> {
        const row = await prisma.experience.findFirst({ where: { id, deletedAt: null }, ...WITH_SKILLS });
        return row ? mapExperience(row) : null;
    }

    async create(data: Omit<Experience, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'skills'> & { skillIds?: string[] }): Promise<Experience> {
        const { skillIds, ...rest } = data as any;
        const row = await prisma.experience.create({
            data: {
                ...rest,
                skills: skillIds?.length
                    ? { create: skillIds.map((id: string) => ({ skillId: id })) }
                    : undefined,
            },
            ...WITH_SKILLS,
        });
        return mapExperience(row);
    }

    async update(id: string, data: Partial<Omit<Experience, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'skills'>> & { skillIds?: string[] }): Promise<Experience | null> {
        const exists = await this.findById(id);
        if (!exists) return null;

        const { skillIds, ...rest } = data as any;
        const row = await prisma.experience.update({
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
        return mapExperience(row);
    }

    async delete(id: string): Promise<boolean> {
        const exists = await prisma.experience.findUnique({ where: { id } });
        if (!exists) return false;
        await prisma.experience.delete({ where: { id } });
        return true;
    }

    async softDelete(id: string): Promise<boolean> {
        const exists = await this.findById(id);
        if (!exists) return false;
        await prisma.experience.update({ where: { id }, data: { deletedAt: new Date() } });
        return true;
    }

    async restore(id: string): Promise<boolean> {
        const exists = await prisma.experience.findUnique({ where: { id } });
        if (!exists) return false;
        await prisma.experience.update({ where: { id }, data: { deletedAt: null } });
        return true;
    }
}
