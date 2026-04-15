import { Router } from 'express';
import { SkillController } from '../controllers/SkillController';
import { SkillUseCases } from '../../../application/use-cases/SkillUseCases';
import { PrismaSkillRepository } from '../../database/prisma/PrismaSkillRepository';
import { validateRequest } from '../middlewares/validateRequest';
import {
    createSkillSchema, updateSkillSchema,
    getSkillByIdSchema, deleteSkillSchema,
} from '../middlewares/validators/skill.validator';
import { authGuard, requireRole } from '../middlewares/authGuard';

const router = Router();

const skillRepository = new PrismaSkillRepository();
const skillUseCases = new SkillUseCases(skillRepository);
const skillController = new SkillController(skillUseCases);

const requireAdmin = requireRole('ADMIN');

/**
 * @swagger
 * components:
 *   schemas:
 *     Skill:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           example: "Next.js"
 *         normalizedName:
 *           type: string
 *           example: "nextjs"
 *           description: Lowercase name stripped of spaces, dots, dashes and underscores. Used as unique key.
 *         isFromLinkedIn:
 *           type: boolean
 *           example: false
 *         isPublic:
 *           type: boolean
 *           description: Whether this skill is visible on the public portfolio Skills section.
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *     CreateSkillBody:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: "React Native"
 *         isFromLinkedIn:
 *           type: boolean
 *           default: false
 *         isPublic:
 *           type: boolean
 *           default: true
 *     UpdateSkillBody:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "React Native"
 *         isFromLinkedIn:
 *           type: boolean
 *         isPublic:
 *           type: boolean
 */

// ─── GET /api/skills ──────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/skills:
 *   get:
 *     summary: Retrieve all active skills
 *     tags: [Skills]
 *     parameters:
 *       - in: query
 *         name: deleted
 *         schema:
 *           type: string
 *           enum: ["true", "false"]
 *         required: false
 *         description: Pass "true" to retrieve soft-deleted skills (trash).
 *     responses:
 *       200:
 *         description: A list of skills
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Skill'
 */
router.get('/', skillController.getAllSkills);

// ─── GET /api/skills/:id ──────────────────────────────────────────────────────
/**
 * @swagger
 * /api/skills/{id}:
 *   get:
 *     summary: Retrieve a skill by ID
 *     tags: [Skills]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Skill found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Skill'
 *       404:
 *         description: Skill not found
 */
router.get('/:id', validateRequest(getSkillByIdSchema), skillController.getSkillById);

// ─── POST /api/skills ─────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/skills:
 *   post:
 *     summary: Create a new skill
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSkillBody'
 *     responses:
 *       201:
 *         description: Skill created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Skill'
 *       400:
 *         description: Validation error
 *       409:
 *         description: A skill with an equivalent normalized name already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — admin role required
 */
router.post('/',
    authGuard, requireAdmin,
    validateRequest(createSkillSchema),
    skillController.createSkill,
);

// ─── PATCH /api/skills/:id ────────────────────────────────────────────────────
/**
 * @swagger
 * /api/skills/{id}:
 *   patch:
 *     summary: Update a skill
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSkillBody'
 *     responses:
 *       200:
 *         description: Skill updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Skill'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Skill not found
 *       409:
 *         description: A skill with an equivalent normalized name already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — admin role required
 */
router.patch('/:id',
    authGuard, requireAdmin,
    validateRequest(updateSkillSchema),
    skillController.updateSkill,
);

// ─── DELETE /api/skills/:id ───────────────────────────────────────────────────
/**
 * @swagger
 * /api/skills/{id}:
 *   delete:
 *     summary: Permanently delete a skill (hard delete)
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Skill deleted
 *       404:
 *         description: Skill not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — admin role required
 */
router.delete('/:id',
    authGuard, requireAdmin,
    validateRequest(deleteSkillSchema),
    skillController.deleteSkill,
);

// ─── PATCH /api/skills/:id/soft-delete ───────────────────────────────────────
/**
 * @swagger
 * /api/skills/{id}/soft-delete:
 *   patch:
 *     summary: Soft-delete a skill (move to trash)
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Skill moved to trash
 *       404:
 *         description: Skill not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — admin role required
 */
router.patch('/:id/soft-delete',
    authGuard, requireAdmin,
    validateRequest(deleteSkillSchema),
    skillController.softDeleteSkill,
);

// ─── PATCH /api/skills/:id/restore ───────────────────────────────────────────
/**
 * @swagger
 * /api/skills/{id}/restore:
 *   patch:
 *     summary: Restore a soft-deleted skill
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Skill restored
 *       404:
 *         description: Skill not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — admin role required
 */
router.patch('/:id/restore',
    authGuard, requireAdmin,
    validateRequest(deleteSkillSchema),
    skillController.restoreSkill,
);

// ─── PATCH /api/skills/:id/relations ─────────────────────────────────────────
/**
 * @swagger
 * /api/skills/{id}/relations:
 *   patch:
 *     summary: Update the entity relations of a skill (projects, experiences, educations)
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projectIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *               experienceIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *               educationIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       200:
 *         description: Relations updated — returns updated skill with all relations
 *       404:
 *         description: Skill not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — admin role required
 */
router.patch('/:id/relations',
    authGuard, requireAdmin,
    skillController.updateRelations,
);

export default router;
