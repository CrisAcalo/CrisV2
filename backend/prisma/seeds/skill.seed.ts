import { PrismaClient } from '@prisma/client';
import { normalizeSkillName } from '../../src/domain/utils/normalizeSkillName';

const SKILLS = [
    'React', 'Node.js', 'Next.js', 'TypeScript', 'JavaScript',
    'PostgreSQL', 'Docker', 'MongoDB', 'NestJS', 'Redis',
    'RabbitMQ', 'Tailwind CSS', 'Framer Motion', 'Three.js',
    'React Native', 'Expo', 'Firebase', 'Zustand', 'Prisma',
    'HTML', 'CSS',
];

export async function seedSkills(prisma: PrismaClient) {
    const created: { name: string; id: string }[] = [];
    for (const name of SKILLS) {
        const normalizedName = normalizeSkillName(name);
        const skill = await prisma.skill.upsert({
            where: { normalizedName },
            create: { name, normalizedName, isFromLinkedIn: false, isPublic: true },
            update: {},
            select: { id: true, name: true },
        });
        created.push(skill);
    }
    console.log(`✅ ${created.length} Skills creadas/verificadas`);
    return created;
}
