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

export const seedProjects = async (prisma: PrismaClient) => {
    const findIds = async (names: string[]) =>
        Promise.all(names.map(n => getSkillId(prisma, n)));

    const projects = [
        {
            title: 'Sistema de Gestión CRM',
            description: 'Plataforma B2B para administrar clientes y flujos de ventas, desarrollada con arquitectura limpia y despliegue automatizado.',
            imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1000',
            repoUrl: 'https://github.com/cris/crm-system',
            liveUrl: 'https://crm.cris.dev',
            isPublished: true,
            skills: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
        },
        {
            title: 'E-commerce Microservicios',
            description: 'Tienda en línea escalable utilizando microservicios, pasarela de pago y mensajería en tiempo real con RabbitMQ.',
            imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1000',
            repoUrl: 'https://github.com/cris/ecommerce-microservices',
            isPublished: true,
            skills: ['Next.js', 'NestJS', 'MongoDB', 'Redis', 'RabbitMQ'],
        },
        {
            title: 'Portfolio Personal 3D',
            description: 'Sitio web personal interactivo con experiencias webGL 3D utilizando Three.js y React Three Fiber.',
            imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1000',
            repoUrl: 'https://github.com/cris/3d-portfolio',
            liveUrl: 'https://cris.dev',
            isPublished: true,
            skills: ['React', 'Three.js', 'Tailwind CSS', 'Framer Motion'],
        },
        {
            title: 'App de Gestión de Finanzas',
            description: 'Aplicación nativa móvil (iOS/Android) enfocada en finanzas personales, análisis de gastos e integración bancaria.',
            imageUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=1000',
            repoUrl: 'https://github.com/cris/finance-app',
            isPublished: false,
            skills: ['React Native', 'Expo', 'Firebase', 'Zustand'],
        }
    ];

    for (const { skills, ...project } of projects) {
        const skillIds = await findIds(skills);
        await prisma.project.create({
            data: {
                ...project,
                skills: { create: skillIds.map(id => ({ skillId: id })) },
            },
        });
    }

    console.log(`✅ ${projects.length} Proyectos creados`);
};
