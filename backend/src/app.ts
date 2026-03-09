import express from 'express';
import cors from 'cors';
import * as swaggerUi from 'swagger-ui-express';
import { errorHandler } from './infrastructure/web/middlewares/errorHandler';
import { swaggerSpec } from './config/swagger';
import authRoutes from './infrastructure/web/routes/auth.routes';
import linkedinRoutes from './infrastructure/web/routes/linkedin.routes';
import projectRoutes from './infrastructure/web/routes/project.routes';
import experienceRoutes from './infrastructure/web/routes/experience.routes';
import educationRoutes from './infrastructure/web/routes/education.routes';
import certificateRoutes from './infrastructure/web/routes/certificate.routes';
import messageRoutes from './infrastructure/web/routes/message.routes';
import settingsRoutes from './infrastructure/web/routes/settings.routes';
import skillRoutes from './infrastructure/web/routes/skill.routes';
import { authGuard, requireRole } from './infrastructure/web/middlewares/authGuard';

const app = express();

// Middlewares Globales
app.use(cors());
app.use(express.json());

// Documentación de Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Ruta de prueba
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Backend Portfolio funcionando correctamente 🚀' });
});

// === RUTAS AQUI ===
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/educations', educationRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/skills', skillRoutes);

// Rutas protegidas (Dashboard / Admin)
app.use('/api/admin/linkedin', authGuard, requireRole('ADMIN'), linkedinRoutes);
app.use('/api/admin/settings', authGuard, requireRole('ADMIN'), settingsRoutes);

// Middleware manejador de errores global al final de la definición de rutas
app.use(errorHandler);

export default app;
