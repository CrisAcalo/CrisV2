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

export const seedExperiences = async (prisma: PrismaClient) => {
    const findIds = async (names: string[]) =>
        Promise.all(names.map(n => getSkillId(prisma, n)));

    const experiences = [
        {
            role: 'Senior Full Stack Engineer',
            company: 'Tech Solutions Inc.',
            startDate: new Date('2021-06-01'),
            endDate: new Date('2024-01-15'),
            description: 'Liderazgo técnico en la migración de aplicaciones monolíticas a microservicios. Implementación de CI/CD reduciendo fallos en un 30%.',
            isImportedFromLinkedIn: false,
            skills: ['React', 'Node.js', 'TypeScript', 'Docker', 'PostgreSQL'],
        },
        {
            role: 'Desarrollador Frontend',
            company: 'Agencia Digital Creative',
            startDate: new Date('2019-02-10'),
            endDate: new Date('2021-05-30'),
            description: 'Desarrollo de interfaces de usuario responsivas e intuitivas. Optimización de rendimiento reduciendo tiempos de carga iniciales.',
            isImportedFromLinkedIn: true,
            skills: ['React', 'JavaScript', 'Tailwind CSS', 'HTML', 'CSS'],
        },
        {
            role: 'Ingeniero de Software Intern',
            company: 'Startup Innovate',
            startDate: new Date('2018-01-15'),
            endDate: new Date('2018-12-20'),
            description: 'Mantenimiento de bases de datos relacionales, refactorización de código legacy y desarrollo de herramientas internas.',
            isImportedFromLinkedIn: false,
            skills: ['Node.js', 'PostgreSQL', 'JavaScript'],
        }
    ];

    for (const { skills, ...exp } of experiences) {
        const skillIds = await findIds(skills);
        await prisma.experience.create({
            data: {
                ...exp,
                skills: { create: skillIds.map(id => ({ skillId: id })) },
            },
        });
    }

    console.log(`✅ ${experiences.length} Experiencias creadas`);
};
