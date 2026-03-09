import { PrismaClient } from '@prisma/client';

export const seedMessages = async (prisma: PrismaClient) => {
    const messages = [
        {
            senderName: 'Reclutador TechCorp',
            senderEmail: 'hr@techcorp.com',
            content: 'Hola Cris, vimos tu portafolio y nos encantó tu perfil. ¿Estarías abierto a una entrevista técnica inicial esta semana?',
            isRead: false,
        },
        {
            senderName: 'Startup Founder',
            senderEmail: 'ceo@startup.io',
            content: 'Me pasaron tu contacto, estamos buscando un líder técnico para un nuevo proyecto fin-tech.',
            isRead: false,
        },
        {
            senderName: 'Jane Smith (Spam Test)',
            senderEmail: 'marketing@randomservice.net',
            content: 'Aumenta tus ventas con nuestros servicios fantásticos de posicionamiento',
            isRead: true, // simular que ya se leyó
        }
    ];

    for (const msg of messages) {
        await prisma.message.create({
            data: msg,
        });
    }

    console.log(`✅ ${messages.length} Mensajes creados`);
};
