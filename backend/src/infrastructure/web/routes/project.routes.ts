import { Router } from 'express';
import { ProjectController } from '../controllers/ProjectController';
import { ProjectUseCases } from '../../../application/use-cases/ProjectUseCases';
import { PrismaProjectRepository } from '../../database/prisma/PrismaProjectRepository';
import { validateRequest } from '../middlewares/validateRequest';
import { createProjectSchema, updateProjectSchema, getProjectByIdSchema, deleteProjectSchema } from '../middlewares/validators/project.validator';
import { authGuard, optionalAuth, requireAdminForDeleted, requireRole } from '../middlewares/authGuard';

const router = Router();

const projectRepository = new PrismaProjectRepository();
const projectUseCases = new ProjectUseCases(projectRepository);
const projectController = new ProjectController(projectUseCases);

/**
 * @swagger
 * components:
 *   schemas:
 *     ProjectCaseStudy:
 *       type: object
 *       nullable: true
 *       properties:
 *         problem:
 *           type: string
 *           maxLength: 900
 *         contribution:
 *           type: string
 *           maxLength: 900
 *         decision:
 *           type: string
 *           maxLength: 900
 *         outcome:
 *           type: string
 *           maxLength: 900
 *     ProjectWrite:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         imageUrl:
 *           type: string
 *           nullable: true
 *         repoUrl:
 *           type: string
 *           nullable: true
 *         liveUrl:
 *           type: string
 *           nullable: true
 *         skillIds:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *         isPublished:
 *           type: boolean
 *         isFeatured:
 *           type: boolean
 *           description: Setting this on a published project replaces any existing featured project.
 *         caseStudy:
 *           $ref: '#/components/schemas/ProjectCaseStudy'
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
 *         skills:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *         repoUrl:
 *           type: string
 *           nullable: true
 *         liveUrl:
 *           type: string
 *           nullable: true
 *         isPublished:
 *           type: boolean
 *         isFeatured:
 *           type: boolean
 *         caseStudy:
 *           $ref: '#/components/schemas/ProjectCaseStudy'
 *         hasCaseStudy:
 *           type: boolean
 *           description: Included in the public list. The full case study is in the project detail.
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
 *     summary: Retrieve projects, with the featured project first
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: A list of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
 */
router.get('/', optionalAuth, requireAdminForDeleted, projectController.getAllProjects);

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
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Project'
 *       404:
 *         description: Project not found
 */
router.get('/:id', optionalAuth, validateRequest(getProjectByIdSchema), projectController.getProjectById);

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
 *             allOf:
 *               - $ref: '#/components/schemas/ProjectWrite'
 *               - type: object
 *                 required: [title]
 *     responses:
 *       201:
 *         description: Created successfully
 *       400:
 *         description: Invalid fields or attempt to feature a draft
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
 *             $ref: '#/components/schemas/ProjectWrite'
 *     responses:
 *       200:
 *         description: Updated successfully
 *       400:
 *         description: Invalid fields or attempt to feature a draft
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
