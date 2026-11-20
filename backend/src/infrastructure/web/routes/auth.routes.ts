import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validateRequest } from '../middlewares/validateRequest';
import { loginSchema, registerSchema } from '../middlewares/validators/auth.validator';
import { authGuard, requireRole } from '../middlewares/authGuard';
import { loginRateLimit } from '../middlewares/rateLimits';
import { loginAccountLimit } from '../middlewares/loginAccountLimit';

const router = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Start a revocable session
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               otp:
 *                 type: string
 *                 description: Six-digit authenticator code when MFA is enabled
 *     responses:
 *       200:
 *         description: Session token, expiry and user identity
 *       401:
 *         description: Invalid credentials or required authenticator verification
 *       429:
 *         description: Login attempt limit reached
 */
router.post('/login', loginRateLimit, validateRequest(loginSchema), loginAccountLimit, AuthController.login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Read the current user identity
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User identity
 *       401:
 *         description: Invalid session
 */
router.get('/me', authGuard, AuthController.me);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Revoke the current session
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Session revoked
 *       401:
 *         description: Invalid session
 */
router.post('/logout', authGuard, AuthController.logout);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a user (administrator only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               role:
 *                 type: string
 *                 enum: [ADMIN, BASIC]
 *     responses:
 *       201:
 *         description: Registered user identity
 *       403:
 *         description: Administrator required
 */
router.post('/register', authGuard, requireRole('ADMIN'), validateRequest(registerSchema), AuthController.register);

export default router;
