import { Router } from 'express';
import { LinkedInController } from '../controllers/LinkedInController';
import { authGuard, requireRole } from '../middlewares/authGuard';

const router = Router();
const requireAdmin = requireRole('ADMIN');

/**
 * @swagger
 * /api/admin/linkedin/sync/experiences:
 *   post:
 *     summary: Sync LinkedIn Experiences
 *     description: Fetches experience from LinkedIn and upserts the database based on the SystemConfiguration URN.
 *     tags: [Admin, LinkedIn]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Exp Sync successful
 */
router.post('/sync/experiences', authGuard, requireAdmin, LinkedInController.syncExperiences);

/**
 * @swagger
 * /api/admin/linkedin/sync/educations:
 *   post:
 *     summary: Sync LinkedIn Educations
 *     description: Fetches education from LinkedIn and upserts the database based on the SystemConfiguration URN.
 *     tags: [Admin, LinkedIn]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Edu Sync successful
 */
router.post('/sync/educations', authGuard, requireAdmin, LinkedInController.syncEducations);

/**
 * @swagger
 * /api/admin/linkedin/sync/certificates:
 *   post:
 *     summary: Sync LinkedIn Certificates
 *     description: Fetches certificates from LinkedIn and upserts the database based on the SystemConfiguration URN.
 *     tags: [Admin, LinkedIn]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cert Sync successful
 */
router.post('/sync/certificates', authGuard, requireAdmin, LinkedInController.syncCertificates);

export default router;
