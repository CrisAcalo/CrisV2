import { PrismaClient } from '@prisma/client';
import { seedUsers } from './seeds/user.seed';
import { seedSkills } from './seeds/skill.seed';
import { seedProjects } from './seeds/project.seed';
import { seedExperiences } from './seeds/experience.seed';
import { seedEducations } from './seeds/education.seed';
import { seedCertificates } from './seeds/certificate.seed';
import { seedMessages } from './seeds/message.seed';

const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Limpiando base de datos (excepto SystemConfiguration)...');

    // Delete in dependency-safe order (children first)
    await prisma.projectSkill.deleteMany();
    await prisma.experienceSkill.deleteMany();
    await prisma.educationSkill.deleteMany();
    await prisma.project.deleteMany();
    await prisma.experience.deleteMany();
    await prisma.education.deleteMany();
    await prisma.certificate.deleteMany();
    await prisma.message.deleteMany();
    await prisma.skill.deleteMany();
    await prisma.user.deleteMany();

    console.log('🌱 Iniciando la población de la base de datos (Seeding Modular)...');

    console.log('--- Generando Usuarios ---');
    await seedUsers(prisma);

    console.log('--- Generando Skills (base) ---');
    await seedSkills(prisma);

    console.log('--- Generando Proyectos ---');
    await seedProjects(prisma);

    console.log('--- Generando Experiencia ---');
    await seedExperiences(prisma);

    console.log('--- Generando Educación ---');
    await seedEducations(prisma);

    console.log('--- Generando Certificados ---');
    await seedCertificates(prisma);

    console.log('--- Generando Mensajes ---');
    await seedMessages(prisma);

    console.log('🎉 Seeding Modular finalizado con éxito.');
}

main()
    .catch((e) => {
        console.error('❌ Error durante la ejecución del seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
