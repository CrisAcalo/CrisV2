import { Router } from 'express';
import { CertificateController } from '../controllers/CertificateController';
import { CertificateUseCases } from '../../../application/use-cases/CertificateUseCases';
import { PrismaCertificateRepository } from '../../database/prisma/PrismaCertificateRepository';
import { validateRequest } from '../middlewares/validateRequest';
import { createCertificateSchema, updateCertificateSchema, getCertificateByIdSchema, deleteCertificateSchema } from '../middlewares/validators/certificate.validator';
import { authGuard, requireRole } from '../middlewares/authGuard';

const router = Router();

const certificateRepository = new PrismaCertificateRepository();
const certificateUseCases = new CertificateUseCases(certificateRepository);
const certificateController = new CertificateController(certificateUseCases);

/**
 * @swagger
 * components:
 *   schemas:
 *     Certificate:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         issuingOrganization:
 *           type: string
 *         issueDate:
 *           type: string
 *           format: date-time
 *         credentialUrl:
 *           type: string
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
 * /api/certificates:
 *   get:
 *     summary: Retrieve all certificates
 *     tags: [Certificates]
 *     responses:
 *       200:
 *         description: A list of certificates
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Certificate'
 */
router.get('/', certificateController.getAllCertificates);

/**
 * @swagger
 * /api/certificates/{id}:
 *   get:
 *     summary: Retrieve a certificate by ID
 *     tags: [Certificates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Certificate found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Certificate'
 *       404:
 *         description: Certificate not found
 */
router.get('/:id', validateRequest(getCertificateByIdSchema), certificateController.getCertificateById);

// Protected Routes (Admin Only)
const requireAdmin = requireRole('ADMIN');

/**
 * @swagger
 * /api/certificates:
 *   post:
 *     summary: Create a new certificate
 *     tags: [Certificates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - issuingOrganization
 *               - issueDate
 *             properties:
 *               name:
 *                 type: string
 *               issuingOrganization:
 *                 type: string
 *               issueDate:
 *                 type: string
 *                 format: date-time
 *               credentialUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', authGuard, requireAdmin, validateRequest(createCertificateSchema), certificateController.createCertificate);

/**
 * @swagger
 * /api/certificates/{id}:
 *   patch:
 *     summary: Update an existing certificate
 *     tags: [Certificates]
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
 *               name:
 *                 type: string
 *               issuingOrganization:
 *                 type: string
 *               issueDate:
 *                 type: string
 *                 format: date-time
 *               credentialUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated successfully
 *       404:
 *         description: Certificate not found
 */
router.patch('/:id', authGuard, requireAdmin, validateRequest(updateCertificateSchema), certificateController.updateCertificate);

/**
 * @swagger
 * /api/certificates/{id}:
 *   delete:
 *     summary: Hard delete a certificate
 *     tags: [Certificates]
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
 *         description: Certificate not found
 */
router.delete('/:id', authGuard, requireAdmin, validateRequest(deleteCertificateSchema), certificateController.deleteCertificate);

/**
 * @swagger
 * /api/certificates/{id}/soft-delete:
 *   patch:
 *     summary: Soft delete a certificate
 *     tags: [Certificates]
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
 *         description: Certificate not found
 */
router.patch('/:id/soft-delete', authGuard, requireAdmin, validateRequest(deleteCertificateSchema), certificateController.softDeleteCertificate);

/**
 * @swagger
 * /api/certificates/{id}/restore:
 *   patch:
 *     summary: Restore a soft-deleted certificate
 *     tags: [Certificates]
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
 *         description: Certificate not found
 */
router.patch('/:id/restore', authGuard, requireAdmin, validateRequest(deleteCertificateSchema), certificateController.restoreCertificate);

export default router;
