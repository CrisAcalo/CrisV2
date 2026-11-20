import { Prisma } from '@prisma/client';
import { prisma } from './client';
import { IProjectRepository, ProjectWrite } from '../../../domain/repositories/IProjectRepository';
import { Project, ProjectCaseStudy } from '../../../domain/entities';
import { BadRequestError } from '../../../domain/errors/AppError';

const WITH_SKILLS = {
    include: {
        skills: { include: { skill: { select: { id: true, name: true, isPublic: true, deletedAt: true } } } }
    }
} as const;

function mapCaseStudy(value: Prisma.JsonValue): ProjectCaseStudy | null {
    if (value === null || typeof value !== 'object' || Array.isArray(value)) return null;

    const caseStudy: ProjectCaseStudy = {};
    for (const field of ['problem', 'contribution', 'decision', 'outcome'] as const) {
        const content = value[field];
        if (typeof content === 'string' && content.trim()) caseStudy[field] = content;
    }
    return Object.keys(caseStudy).length ? caseStudy : null;
}

function caseStudyForPrisma(value: ProjectCaseStudy | null | undefined) {
    if (value === null) return Prisma.DbNull;
    return value ? { ...value } : undefined;
}

function mapProject(raw: Prisma.ProjectGetPayload<typeof WITH_SKILLS>): Project {
    return {
        ...raw,
        caseStudy: mapCaseStudy(raw.caseStudy),
        skills: raw.skills.map(({ skill }) => skill),
    };
}

function requirePublished(isPublished: boolean) {
    if (!isPublished) throw new BadRequestError('Publica el proyecto antes de destacarlo');
}

async function lockFeatureSwitch<T>(change: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return prisma.$transaction(async (tx) => {
        // Serialize featured-project switches against one another and publication changes.
        await tx.$executeRaw`LOCK TABLE "Project" IN SHARE ROW EXCLUSIVE MODE`;
        return change(tx);
    });
}

export class PrismaProjectRepository implements IProjectRepository {
    async findAll(includeDeleted: boolean = false): Promise<Project[]> {
        const rows = await prisma.project.findMany({
            where: { deletedAt: includeDeleted ? { not: null } : null },
            orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }, { id: 'asc' }],
            ...WITH_SKILLS,
        });
        return rows.map(mapProject);
    }

    async findById(id: string): Promise<Project | null> {
        const row = await prisma.project.findFirst({ where: { id, deletedAt: null }, ...WITH_SKILLS });
        return row ? mapProject(row) : null;
    }

    async create(data: ProjectWrite): Promise<Project> {
        const { skillIds, caseStudy, ...fields } = data;
        const input = {
            ...fields,
            caseStudy: caseStudyForPrisma(caseStudy),
            skills: skillIds?.length
                ? { create: [...new Set(skillIds)].map((skillId) => ({ skillId })) }
                : undefined,
        };
        const create = (db: Prisma.TransactionClient) => db.project.create({ data: input, ...WITH_SKILLS });
        const row = fields.isFeatured
            ? await lockFeatureSwitch(async (tx) => {
                requirePublished(fields.isPublished);
                await tx.project.updateMany({ where: { isFeatured: true }, data: { isFeatured: false } });
                return create(tx);
            })
            : await create(prisma);
        return mapProject(row);
    }

    async update(id: string, data: Partial<ProjectWrite>): Promise<Project | null> {
        const { skillIds, caseStudy, isFeatured, ...fields } = data;
        const update = (db: Prisma.TransactionClient) => db.project.update({
            where: { id, deletedAt: null },
            data: {
                ...fields,
                isFeatured: fields.isPublished === false ? false : isFeatured,
                caseStudy: caseStudyForPrisma(caseStudy),
                skills: skillIds === undefined ? undefined : {
                    deleteMany: {},
                    create: [...new Set(skillIds)].map((skillId) => ({ skillId })),
                },
            },
            ...WITH_SKILLS,
        });

        try {
            const row = isFeatured
                ? await lockFeatureSwitch(async (tx) => {
                    const current = await tx.project.findUnique({ where: { id, deletedAt: null }, select: { isPublished: true } });
                    if (!current) return null;
                    requirePublished(fields.isPublished ?? current.isPublished);
                    await tx.project.updateMany({ where: { isFeatured: true, id: { not: id } }, data: { isFeatured: false } });
                    return update(tx);
                })
                : await update(prisma);
            return row ? mapProject(row) : null;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') return null;
            throw error;
        }
    }

    async delete(id: string): Promise<boolean> {
        const exists = await prisma.project.findUnique({ where: { id } });
        if (!exists) return false;
        await prisma.project.delete({ where: { id } });
        return true;
    }

    async softDelete(id: string): Promise<boolean> {
        const { count } = await prisma.project.updateMany({
            where: { id, deletedAt: null },
            data: { deletedAt: new Date(), isFeatured: false },
        });
        return count > 0;
    }

    async restore(id: string): Promise<boolean> {
        const exists = await prisma.project.findUnique({ where: { id } });
        if (!exists) return false;
        await prisma.project.update({ where: { id }, data: { deletedAt: null } });
        return true;
    }
}
