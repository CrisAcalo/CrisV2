import { prisma } from './client';
import { ILinkedInSyncRepository } from '../../../domain/repositories/ILinkedInSyncRepository';
import { Experience, Education, Certificate } from '../../../domain/entities';
import { normalizeSkillName } from '../../../domain/utils/normalizeSkillName';

/**
 * For a list of skill names, upsert each skill (by normalizedName) and return their IDs.
 * This NEVER deletes existing skills.
 */
async function upsertSkillIds(names: string[], isFromLinkedIn: boolean): Promise<string[]> {
    const ids: string[] = [];
    for (const name of names) {
        const normalizedName = normalizeSkillName(name);
        if (!normalizedName) continue;
        const skill = await prisma.skill.upsert({
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
        // Delete all previously-imported experiences (cascade removes ExperienceSkill rows, NOT Skill rows)
        await prisma.experience.deleteMany({ where: { isImportedFromLinkedIn: true } });

        for (const exp of experiences) {
            const skillIds = exp.skillNames?.length
                ? await upsertSkillIds(exp.skillNames, true)
                : [];

            await prisma.experience.create({
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
    }

    async upsertEducation(educations: (Education & { skillNames?: string[] })[]): Promise<void> {
        await prisma.education.deleteMany({ where: { isImportedFromLinkedIn: true } });

        for (const edu of educations) {
            const skillIds = edu.skillNames?.length
                ? await upsertSkillIds(edu.skillNames, true)
                : [];

            await prisma.education.create({
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
    }

    async upsertCertificates(certificates: Certificate[]): Promise<void> {
        await prisma.certificate.deleteMany({ where: { isImportedFromLinkedIn: true } });

        if (certificates.length > 0) {
            await prisma.certificate.createMany({
                data: certificates.map(cert => ({
                    name: cert.name,
                    issuingOrganization: cert.issuingOrganization,
                    issueDate: cert.issueDate,
                    credentialUrl: cert.credentialUrl,
                    isImportedFromLinkedIn: true,
                }))
            });
        }
    }
}
