import { Router } from 'express';
import { ProjectController } from '../controllers/ProjectController';
import { ProjectUseCases } from '../../../application/use-cases/ProjectUseCases';
import { PrismaProjectRepository } from '../../database/prisma/PrismaProjectRepository';
import { validateRequest } from '../middlewares/validateRequest';
import { createProjectSchema, updateProjectSchema, getProjectByIdSchema, deleteProjectSchema } from '../middlewares/validators/project.validator';
import { authGuard, requireRole } from '../middlewares/authGuard';

const router = Router();

const projectRepository = new PrismaProjectRepository();
const projectUseCases = new ProjectUseCases(projectRepository);
const projectController = new ProjectController(projectUseCases);

/**
 * @swagger
 * components:
 *   schemas:
 *     Project:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         imageUrl:
 *           type: string
 *           nullable: true
 *         techStack:
 *           type: array
 *           items:
 *             type: string
 *         repoUrl:
 *           type: string
 *           nullable: true
 *         liveUrl:
 *           type: string
 *           nullable: true
 *         isPublished:
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
 * /api/projects:
 *   get:
 *     summary: Retrieve all projects
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: A list of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 */
router.get('/', projectController.getAllProjects);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Retrieve a project by ID
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Project found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 */
router.get('/:id', validateRequest(getProjectByIdSchema), projectController.getProjectById);

// Protected Routes (Admin Only)
const requireAdmin = requireRole('ADMIN');

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - techStack
 *               - isPublished
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               techStack:
 *                 type: array
 *                 items:
 *                   type: string
 *               imageUrl:
 *                 type: string
 *               repoUrl:
 *                 type: string
 *               liveUrl:
 *                 type: string
 *               isPublished:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', authGuard, requireAdmin, validateRequest(createProjectSchema), projectController.createProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   patch:
 *     summary: Update an existing project
 *     tags: [Projects]
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               techStack:
 *                 type: array
 *                 items:
 *                   type: string
 *               isPublished:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated successfully
 *       404:
 *         description: Project not found
 */
router.patch('/:id', authGuard, requireAdmin, validateRequest(updateProjectSchema), projectController.updateProject);

/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Hard delete a project
 *     tags: [Projects]
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
 *         description: Project not found
 */
router.delete('/:id', authGuard, requireAdmin, validateRequest(deleteProjectSchema), projectController.deleteProject);

/**
 * @swagger
 * /api/projects/{id}/soft-delete:
 *   patch:
 *     summary: Soft delete a project
 *     tags: [Projects]
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
 *         description: Project not found
 */
router.patch('/:id/soft-delete', authGuard, requireAdmin, validateRequest(deleteProjectSchema), projectController.softDeleteProject);

/**
 * @swagger
 * /api/projects/{id}/restore:
 *   patch:
 *     summary: Restore a soft-deleted project
 *     tags: [Projects]
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
 *         description: Project not found
 */
router.patch('/:id/restore', authGuard, requireAdmin, validateRequest(deleteProjectSchema), projectController.restoreProject);

export default router;
