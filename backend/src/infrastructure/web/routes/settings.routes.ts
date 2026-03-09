import { Router } from 'express';
import { SettingsController } from '../controllers/SettingsController';
import { validateRequest } from '../middlewares/validateRequest';
import { updateSettingsSchema } from '../middlewares/validators/settings.validator';
import { authGuard, requireRole } from '../middlewares/authGuard';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     SystemConfiguration:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         linkedInUrn:
 *           type: string
 *           nullable: true
 *         theme:
 *           type: string
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const requireAdmin = requireRole('ADMIN');

/**
 * @swagger
 * /api/admin/settings:
 *   get:
 *     summary: Retrieve system configurations
 *     tags: [Admin, Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System settings returned successfully
 */
router.get('/', authGuard, requireAdmin, SettingsController.getSettings);

/**
 * @swagger
 * /api/admin/settings:
 *   patch:
 *     summary: Update system configurations (like URN and Theme)
 *     tags: [Admin, Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               linkedInUrn:
 *                 type: string
 *               theme:
 *                 type: string
 *     responses:
 *       200:
 *         description: System settings updated successfully
 */
router.patch('/', authGuard, requireAdmin, validateRequest(updateSettingsSchema), SettingsController.updateSettings);

export default router;
