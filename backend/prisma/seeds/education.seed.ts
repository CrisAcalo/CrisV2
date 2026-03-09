import { PrismaClient } from '@prisma/client';
import { normalizeSkillName } from '../../src/domain/utils/normalizeSkillName';

async function getSkillId(prisma: PrismaClient, name: string): Promise<string> {
    const skill = await prisma.skill.findUnique({
        where: { normalizedName: normalizeSkillName(name) },
        select: { id: true },
    });
    if (!skill) throw new Error(`Skill no encontrada: "${name}"`);
    return skill.id;
}

export const seedEducations = async (prisma: PrismaClient) => {
    const findIds = async (names: string[]) =>
        Promise.all(names.map(n => getSkillId(prisma, n)));

    const educations = [
        {
            institution: 'Universidad Tecnológica Abierta',
            degree: 'Maestría en Ciencias de la Computación',
            startDate: new Date('2022-03-01'),
            endDate: new Date('2024-03-15'),
            skills: ['TypeScript', 'Node.js', 'PostgreSQL'],
        },
        {
            institution: 'Universidad Tecnológica Libre',
            degree: 'Ingeniería en Software',
            startDate: new Date('2017-08-01'),
            endDate: new Date('2021-12-01'),
            skills: ['JavaScript', 'React', 'HTML', 'CSS'],
        },
        {
            institution: 'Instituto de Idiomas',
            degree: 'Certificación de Inglés C1 Bilingüe',
            startDate: new Date('2015-01-10'),
            endDate: new Date('2016-11-20'),
            skills: [],
        }
    ];

    for (const { skills, ...edu } of educations) {
        const skillIds = await findIds(skills);
        await prisma.education.create({
            data: {
                ...edu,
                skills: skillIds.length
                    ? { create: skillIds.map(id => ({ skillId: id })) }
                    : undefined,
            },
        });
    }

    console.log(`✅ ${educations.length} Educaciones creadas`);
};
