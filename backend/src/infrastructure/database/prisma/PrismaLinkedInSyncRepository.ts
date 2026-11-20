import { prisma } from './client';
import { ILinkedInSyncRepository } from '../../../domain/repositories/ILinkedInSyncRepository';
import { Experience, Education, Certificate } from '../../../domain/entities';
import { normalizeSkillName } from '../../../domain/utils/normalizeSkillName';
import { Prisma } from '@prisma/client';

/**
 * For a list of skill names, upsert each skill (by normalizedName) and return their IDs.
 * This NEVER deletes existing skills.
 */
async function upsertSkillIds(db: Prisma.TransactionClient, names: string[], isFromLinkedIn: boolean): Promise<string[]> {
    const ids: string[] = [];
    for (const name of names) {
        const normalizedName = normalizeSkillName(name);
        if (!normalizedName) continue;
        const skill = await db.skill.upsert({
            where: { normalizedName },
            create: { name, normalizedName, isFromLinkedIn, isPublic: true },
            update: {},                     // keep existing data as-is
            select: { id: true },
        });
        ids.push(skill.id);
    }
    return ids;
}

export class PrismaLinkedInSyncRepository implements ILinkedInSyncRepository {

    async upsertExperiences(experiences: (Experience & { skillNames?: string[] })[]): Promise<void> {
        await prisma.$transaction(async db => {
            await db.experience.deleteMany({ where: { isImportedFromLinkedIn: true } });
            for (const exp of experiences) {
                const skillIds = exp.skillNames?.length
                    ? await upsertSkillIds(db, exp.skillNames, true)
                    : [];

                await db.experience.create({
                    data: {
                        role: exp.role,
                        company: exp.company,
                        startDate: exp.startDate,
                        endDate: exp.endDate,
                        description: exp.description,
                        isImportedFromLinkedIn: true,
                        skills: skillIds.length
                            ? { create: skillIds.map(id => ({ skillId: id })) }
                            : undefined,
                    },
                });
            }
        }, { timeout: 30000 });
    }

    async upsertEducation(educations: (Education & { skillNames?: string[] })[]): Promise<void> {
        await prisma.$transaction(async db => {
            await db.education.deleteMany({ where: { isImportedFromLinkedIn: true } });
            for (const edu of educations) {
                const skillIds = edu.skillNames?.length
                    ? await upsertSkillIds(db, edu.skillNames, true)
                    : [];

                await db.education.create({
                    data: {
                        institution: edu.institution,
                        degree: edu.degree,
                        startDate: edu.startDate,
                        endDate: edu.endDate,
                        isImportedFromLinkedIn: true,
                        skills: skillIds.length
                            ? { create: skillIds.map(id => ({ skillId: id })) }
                            : undefined,
                    },
                });
            }
        }, { timeout: 30000 });
    }

    async upsertCertificates(certificates: Certificate[]): Promise<void> {
        await prisma.$transaction(async db => {
            await db.certificate.deleteMany({ where: { isImportedFromLinkedIn: true } });
            if (certificates.length > 0) {
                await db.certificate.createMany({
                    data: certificates.map(cert => ({
                        name: cert.name,
                        issuingOrganization: cert.issuingOrganization,
                        issueDate: cert.issueDate,
                        credentialUrl: cert.credentialUrl,
                        isImportedFromLinkedIn: true,
                    }))
                });
            }
        }, { timeout: 30000 });
    }
}
