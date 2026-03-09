import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validateRequest } from '../middlewares/validateRequest';
import { loginSchema, registerSchema } from '../middlewares/validators/auth.validator';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *           format: email
 *         role:
 *           type: string
 *           enum: [ADMIN, BASIC]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@portfolio.com
 *               password:
 *                 type: string
 *                 example: S3cr3tP@ssw0rd!
 *               role:
 *                 type: string
 *                 enum: [ADMIN, BASIC]
 *                 example: ADMIN
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation Error or User Exists
 */
router.post('/register', validateRequest(registerSchema), AuthController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@portfolio.com
 *               password:
 *                 type: string
 *                 example: S3cr3tP@ssw0rd!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 role:
 *                   type: string
 *                   enum: [ADMIN, BASIC]
 *       400:
 *         description: Validation Error
 *       401:
 *         description: Unauthorized
 */
router.post('/login', validateRequest(loginSchema), AuthController.login);

export default router;
