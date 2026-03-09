import { prisma } from './client';
import { IProjectRepository } from '../../../domain/repositories/IProjectRepository';
import { Project } from '../../../domain/entities';

const WITH_SKILLS = {
    include: {
        skills: { include: { skill: { select: { id: true, name: true } } } }
    }
} as const;

function mapProject(raw: any): Project {
    return {
        ...raw,
        skills: raw.skills?.map((s: any) => ({ id: s.skill.id, name: s.skill.name })) ?? [],
    };
}

export class PrismaProjectRepository implements IProjectRepository {
    async findAll(includeDeleted: boolean = false): Promise<Project[]> {
        const rows = await prisma.project.findMany({
            where: { deletedAt: includeDeleted ? { not: null } : null },
            orderBy: { createdAt: 'desc' },
            ...WITH_SKILLS,
        });
        return rows.map(mapProject);
    }

    async findById(id: string): Promise<Project | null> {
        const row = await prisma.project.findFirst({ where: { id, deletedAt: null }, ...WITH_SKILLS });
        return row ? mapProject(row) : null;
    }

    async create(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'skills'> & { skillIds?: string[] }): Promise<Project> {
        const { skillIds, ...rest } = data as any;
        const row = await prisma.project.create({
            data: {
                ...rest,
                skills: skillIds?.length
                    ? { create: skillIds.map((id: string) => ({ skillId: id })) }
                    : undefined,
            },
            ...WITH_SKILLS,
        });
        return mapProject(row);
    }

    async update(id: string, data: Partial<Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt' | 'skills'>> & { skillIds?: string[] }): Promise<Project | null> {
        const exists = await this.findById(id);
        if (!exists) return null;

        const { skillIds, ...rest } = data as any;
        const row = await prisma.project.update({
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
        return mapProject(row);
    }

    async delete(id: string): Promise<boolean> {
        const exists = await prisma.project.findUnique({ where: { id } });
        if (!exists) return false;
        await prisma.project.delete({ where: { id } });
        return true;
    }

    async softDelete(id: string): Promise<boolean> {
        const exists = await this.findById(id);
        if (!exists) return false;
        await prisma.project.update({ where: { id }, data: { deletedAt: new Date() } });
        return true;
    }

    async restore(id: string): Promise<boolean> {
        const exists = await prisma.project.findUnique({ where: { id } });
        if (!exists) return false;
        await prisma.project.update({ where: { id }, data: { deletedAt: null } });
        return true;
    }
}
