import { env } from './config/env';
import { security } from './config/security';
import app from './app';
import { prisma } from './infrastructure/database/prisma/client';

const PORT = env.PORT || 4000;

// In local development, close the API when its Nodemon parent loses the IPC channel.
if (env.CRISV2_DEV_HOST && process.connected) {
    process.once('disconnect', () => process.exit(0));
}

const startServer = async () => {
    try {
        await prisma.$connect();
        console.log('✅ Conexión a la base de datos (PostgreSQL) establecida correctamente.');

        app.listen({ port: Number(PORT), host: env.CRISV2_DEV_HOST }, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
            if (security.swaggerEnabled) {
                console.log(`📑 Swagger UI disponible en http://localhost:${PORT}/api-docs`);
            }
        });
    } catch {
        console.error('❌ Error al conectar con la base de datos.');
        process.exit(1);
    }
};

startServer();
