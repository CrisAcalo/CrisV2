import { prisma } from './client';
import { ISkillRepository } from '../../../domain/repositories/ISkillRepository';
import { Skill } from '../../../domain/entities';
import { normalizeSkillName } from '../../../domain/utils/normalizeSkillName';

const SKILL_QUERY = {
    select: {
        id: true, name: true, normalizedName: true,
        isFromLinkedIn: true, isPublic: true,
        createdAt: true, updatedAt: true, deletedAt: true,
        experiences: {
            select: {
                experience: { select: { id: true, role: true, company: true } }
            }
        },
        educations: {
            select: {
                education: { select: { id: true, institution: true, degree: true } }
            }
        },
        projects: {
            select: {
                project: { select: { id: true, title: true } }
            }
        },
    }
} as const;

function mapSkill(raw: any): Skill {
    return {
        ...raw,
        experiences: raw.experiences?.map((r: any) => r.experience) ?? [],
        educations: raw.educations?.map((r: any) => r.education) ?? [],
        projects: raw.projects?.map((r: any) => r.project) ?? [],
    };
}

export class PrismaSkillRepository implements ISkillRepository {

    async findAll(includeDeleted = false): Promise<Skill[]> {
        const rows = await prisma.skill.findMany({
            where: { deletedAt: includeDeleted ? { not: null } : null },
            orderBy: { name: 'asc' },
            ...SKILL_QUERY,
        });
        return rows.map(mapSkill);
    }

    async findById(id: string): Promise<Skill | null> {
        const row = await prisma.skill.findFirst({ where: { id, deletedAt: null }, ...SKILL_QUERY });
        return row ? mapSkill(row) : null;
    }

    async findByNormalizedName(normalizedName: string): Promise<Skill | null> {
        const row = await prisma.skill.findUnique({ where: { normalizedName }, ...SKILL_QUERY });
        return row ? mapSkill(row) : null;
    }

    async create(data: { name: string; normalizedName: string; isFromLinkedIn?: boolean; isPublic?: boolean }): Promise<Skill> {
        const row = await prisma.skill.create({
            data: {
                name: data.name,
                normalizedName: data.normalizedName,
                isFromLinkedIn: data.isFromLinkedIn ?? false,
                isPublic: data.isPublic ?? true,
            },
            ...SKILL_QUERY,
        });
        return mapSkill(row);
    }

    async update(id: string, data: Partial<Pick<Skill, 'name' | 'isFromLinkedIn' | 'isPublic'>>): Promise<Skill | null> {
        const exists = await this.findById(id);
        if (!exists) return null;

        const updateData: any = { ...data };
        if (data.name) {
            updateData.normalizedName = normalizeSkillName(data.name);
        }

        const row = await prisma.skill.update({ where: { id }, data: updateData, ...SKILL_QUERY });
        return mapSkill(row);
    }

    async delete(id: string): Promise<boolean> {
        const exists = await prisma.skill.findUnique({ where: { id } });
        if (!exists) return false;
        await prisma.skill.delete({ where: { id } });
        return true;
    }

    async softDelete(id: string): Promise<boolean> {
        const exists = await this.findById(id);
        if (!exists) return false;
        await prisma.skill.update({ where: { id }, data: { deletedAt: new Date() } });
        return true;
    }

    async restore(id: string): Promise<boolean> {
        const exists = await prisma.skill.findUnique({ where: { id } });
        if (!exists) return false;
        await prisma.skill.update({ where: { id }, data: { deletedAt: null } });
        return true;
    }

    /**
     * For each name: normalize → find existing (even soft-deleted) → or create.
     * Never deletes skills. Used by LinkedIn sync and manual create with skillNames.
     */
    async upsertMany(names: string[], isFromLinkedIn = false): Promise<Skill[]> {
        const results: Skill[] = [];
        for (const name of names) {
            const normalized = normalizeSkillName(name);
            if (!normalized) continue;

            // Check including soft-deleted so we never create a duplicate
            const existing = await prisma.skill.findUnique({ where: { normalizedName: normalized }, ...SKILL_QUERY });
            if (existing) {
                results.push(mapSkill(existing));
            } else {
                const created = await prisma.skill.create({
                    data: { name, normalizedName: normalized, isFromLinkedIn, isPublic: true },
                    ...SKILL_QUERY,
                });
                results.push(mapSkill(created));
            }
        }
        return results;
    }
}
