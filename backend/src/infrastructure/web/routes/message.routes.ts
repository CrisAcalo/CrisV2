import { Router } from 'express';
import { MessageController } from '../controllers/MessageController';
import { MessageUseCases } from '../../../application/use-cases/MessageUseCases';
import { PrismaMessageRepository } from '../../database/prisma/PrismaMessageRepository';
import { validateRequest } from '../middlewares/validateRequest';
import { createMessageSchema, updateMessageSchema, getMessageByIdSchema, deleteMessageSchema } from '../middlewares/validators/message.validator';
import { authGuard, requireRole } from '../middlewares/authGuard';

const router = Router();

const messageRepository = new PrismaMessageRepository();
const messageUseCases = new MessageUseCases(messageRepository);
const messageController = new MessageController(messageUseCases);

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         senderName:
 *           type: string
 *         senderEmail:
 *           type: string
 *           format: email
 *         content:
 *           type: string
 *         isRead:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// Public Route (Contact Form Submission)

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: Submit a new contact message
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - senderName
 *               - senderEmail
 *               - content
 *             properties:
 *               senderName:
 *                 type: string
 *               senderEmail:
 *                 type: string
 *                 format: email
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 *       400:
 *         description: Validation Error
 */
router.post('/', validateRequest(createMessageSchema), messageController.createMessage);

// Protected Routes (Admin Only)
const requireAdmin = requireRole('ADMIN');

/**
 * @swagger
 * /api/messages:
 *   get:
 *     summary: Retrieve all messages
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', authGuard, requireAdmin, messageController.getAllMessages);

/**
 * @swagger
 * /api/messages/{id}:
 *   get:
 *     summary: Retrieve a message by ID
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *       404:
 *         description: Message not found
 */
router.get('/:id', authGuard, requireAdmin, validateRequest(getMessageByIdSchema), messageController.getMessageById);

/**
 * @swagger
 * /api/messages/{id}:
 *   patch:
 *     summary: Update an existing message (e.g. mark as read)
 *     tags: [Messages]
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
 *               isRead:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated successfully
 *       404:
 *         description: Message not found
 */
router.patch('/:id', authGuard, requireAdmin, validateRequest(updateMessageSchema), messageController.updateMessage);

/**
 * @swagger
 * /api/messages/{id}:
 *   delete:
 *     summary: Hard delete a message
 *     tags: [Messages]
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
 *         description: Message not found
 */
router.delete('/:id', authGuard, requireAdmin, validateRequest(deleteMessageSchema), messageController.deleteMessage);

/**
 * @swagger
 * /api/messages/{id}/soft-delete:
 *   patch:
 *     summary: Soft delete a message
 *     tags: [Messages]
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
 *         description: Message not found
 */
router.patch('/:id/soft-delete', authGuard, requireAdmin, validateRequest(deleteMessageSchema), messageController.softDeleteMessage);

/**
 * @swagger
 * /api/messages/{id}/restore:
 *   patch:
 *     summary: Restore a soft-deleted message
 *     tags: [Messages]
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
 *         description: Message not found
 */
router.patch('/:id/restore', authGuard, requireAdmin, validateRequest(deleteMessageSchema), messageController.restoreMessage);

export default router;
