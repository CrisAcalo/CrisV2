import { Router } from 'express';
import { ExperienceController } from '../controllers/ExperienceController';
import { ExperienceUseCases } from '../../../application/use-cases/ExperienceUseCases';
import { PrismaExperienceRepository } from '../../database/prisma/PrismaExperienceRepository';
import { validateRequest } from '../middlewares/validateRequest';
import { createExperienceSchema, updateExperienceSchema, getExperienceByIdSchema, deleteExperienceSchema } from '../middlewares/validators/experience.validator';
import { authGuard, requireRole } from '../middlewares/authGuard';

const router = Router();

const experienceRepository = new PrismaExperienceRepository();
const experienceUseCases = new ExperienceUseCases(experienceRepository);
const experienceController = new ExperienceController(experienceUseCases);

/**
 * @swagger
 * components:
 *   schemas:
 *     Experience:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         role:
 *           type: string
 *         company:
 *           type: string
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         description:
 *           type: string
 *           nullable: true
 *         isImportedFromLinkedIn:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/experiences:
 *   get:
 *     summary: Retrieve all experiences
 *     tags: [Experiences]
 *     responses:
 *       200:
 *         description: A list of experiences
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Experience'
 */
router.get('/', experienceController.getAllExperiences);

/**
 * @swagger
 * /api/experiences/{id}:
 *   get:
 *     summary: Retrieve an experience by ID
 *     tags: [Experiences]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Experience found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Experience'
 *       404:
 *         description: Experience not found
 */
router.get('/:id', validateRequest(getExperienceByIdSchema), experienceController.getExperienceById);

// Protected Routes (Admin Only)
const requireAdmin = requireRole('ADMIN');

/**
 * @swagger
 * /api/experiences:
 *   post:
 *     summary: Create a new experience
 *     tags: [Experiences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *               - company
 *               - startDate
 *               - isImportedFromLinkedIn
 *             properties:
 *               role:
 *                 type: string
 *               company:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               description:
 *                 type: string
 *               isImportedFromLinkedIn:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', authGuard, requireAdmin, validateRequest(createExperienceSchema), experienceController.createExperience);

/**
 * @swagger
 * /api/experiences/{id}:
 *   patch:
 *     summary: Update an existing experience
 *     tags: [Experiences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *               company:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated successfully
 *       404:
 *         description: Experience not found
 */
router.patch('/:id', authGuard, requireAdmin, validateRequest(updateExperienceSchema), experienceController.updateExperience);

/**
 * @swagger
 * /api/experiences/{id}:
 *   delete:
 *     summary: Hard delete an experience
 *     tags: [Experiences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Deleted successfully
 *       404:
 *         description: Experience not found
 */
router.delete('/:id', authGuard, requireAdmin, validateRequest(deleteExperienceSchema), experienceController.deleteExperience);

/**
 * @swagger
 * /api/experiences/{id}/soft-delete:
 *   patch:
 *     summary: Soft delete an experience
 *     tags: [Experiences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Soft deleted successfully
 *       404:
 *         description: Experience not found
 */
router.patch('/:id/soft-delete', authGuard, requireAdmin, validateRequest(deleteExperienceSchema), experienceController.softDeleteExperience);

/**
 * @swagger
 * /api/experiences/{id}/restore:
 *   patch:
 *     summary: Restore a soft-deleted experience
 *     tags: [Experiences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Restored successfully
 *       404:
 *         description: Experience not found
 */
router.patch('/:id/restore', authGuard, requireAdmin, validateRequest(deleteExperienceSchema), experienceController.restoreExperience);

export default router;
