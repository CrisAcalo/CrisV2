import { env } from './config/env';
import app from './app';
import { prisma } from './infrastructure/database/prisma/client';

const PORT = env.PORT || 4000;

const startServer = async () => {
    try {
        await prisma.$connect();
        console.log('✅ Conexión a la base de datos (PostgreSQL) establecida correctamente.');

        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
            console.log(`📑 Swagger UI disponible en http://localhost:${PORT}/api-docs`);
        });
    } catch (error) {
        console.error('❌ Error al conectar con la base de datos:', error);
        process.exit(1);
    }
};

startServer();