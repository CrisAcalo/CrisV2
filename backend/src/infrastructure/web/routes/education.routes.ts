import { Router } from 'express';
import { EducationController } from '../controllers/EducationController';
import { EducationUseCases } from '../../../application/use-cases/EducationUseCases';
import { PrismaEducationRepository } from '../../database/prisma/PrismaEducationRepository';
import { validateRequest } from '../middlewares/validateRequest';
import { createEducationSchema, updateEducationSchema, getEducationByIdSchema, deleteEducationSchema } from '../middlewares/validators/education.validator';
import { authGuard, requireRole } from '../middlewares/authGuard';

const router = Router();

const educationRepository = new PrismaEducationRepository();
const educationUseCases = new EducationUseCases(educationRepository);
const educationController = new EducationController(educationUseCases);

/**
 * @swagger
 * components:
 *   schemas:
 *     Education:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         institution:
 *           type: string
 *         degree:
 *           type: string
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/educations:
 *   get:
 *     summary: Retrieve all educations
 *     tags: [Educations]
 *     responses:
 *       200:
 *         description: A list of educations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Education'
 */
router.get('/', educationController.getAllEducations);

/**
 * @swagger
 * /api/educations/{id}:
 *   get:
 *     summary: Retrieve an education entry by ID
 *     tags: [Educations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Education entry found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Education'
 *       404:
 *         description: Education not found
 */
router.get('/:id', validateRequest(getEducationByIdSchema), educationController.getEducationById);

// Protected Routes (Admin Only)
const requireAdmin = requireRole('ADMIN');

/**
 * @swagger
 * /api/educations:
 *   post:
 *     summary: Create a new education entry
 *     tags: [Educations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - institution
 *               - degree
 *               - startDate
 *             properties:
 *               institution:
 *                 type: string
 *               degree:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', authGuard, requireAdmin, validateRequest(createEducationSchema), educationController.createEducation);

/**
 * @swagger
 * /api/educations/{id}:
 *   patch:
 *     summary: Update an existing education entry
 *     tags: [Educations]
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
 *               institution:
 *                 type: string
 *               degree:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Updated successfully
 *       404:
 *         description: Education not found
 */
router.patch('/:id', authGuard, requireAdmin, validateRequest(updateEducationSchema), educationController.updateEducation);

/**
 * @swagger
 * /api/educations/{id}:
 *   delete:
 *     summary: Hard delete an education entry
 *     tags: [Educations]
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
 *         description: Education not found
 */
router.delete('/:id', authGuard, requireAdmin, validateRequest(deleteEducationSchema), educationController.deleteEducation);

/**
 * @swagger
 * /api/educations/{id}/soft-delete:
 *   patch:
 *     summary: Soft delete an education entry
 *     tags: [Educations]
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
 *         description: Education not found
 */
router.patch('/:id/soft-delete', authGuard, requireAdmin, validateRequest(deleteEducationSchema), educationController.softDeleteEducation);

/**
 * @swagger
 * /api/educations/{id}/restore:
 *   patch:
 *     summary: Restore a soft-deleted education entry
 *     tags: [Educations]
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
 *         description: Education not found
 */
router.patch('/:id/restore', authGuard, requireAdmin, validateRequest(deleteEducationSchema), educationController.restoreEducation);

export default router;
