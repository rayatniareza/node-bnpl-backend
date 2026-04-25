const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/auth');
const { adminMiddleware } = require('../middlewares/roles');

/**
 * @swagger
 * /api/admin/credit-products:
 *   post:
 *     summary: Create a new credit product
 *     tags: [Admin]
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
 *               - providerId
 *               - type
 *               - minKycLevel
 *               - defaultAmount
 *               - maxAmount
 *               - installmentCount
 *               - tenorMonths
 *               - interestRate
 *             properties:
 *               title:
 *                 type: string
 *               providerId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [Public, Whitelist]
 *               minKycLevel:
 *                 type: integer
 *               defaultAmount:
 *                 type: number
 *               maxAmount:
 *                 type: number
 *               installmentCount:
 *                 type: integer
 *               tenorMonths:
 *                 type: integer
 *               interestRate:
 *                 type: number
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/credit-products', authMiddleware, adminMiddleware, adminController.createCreditProduct);

/**
 * @swagger
 * /api/admin/credit-products/{productId}/whitelist:
 *   post:
 *     summary: Add organizations to product whitelist
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organizationIds
 *             properties:
 *               organizationIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Whitelist updated successfully
 *       404:
 *         description: Product not found
 */
router.post('/credit-products/:productId/whitelist', authMiddleware, adminMiddleware, adminController.addProductWhitelist);

/**
 * @swagger
 * /api/admin/organizations/{organizationId}/users:
 *   post:
 *     summary: Assign users to an organization
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Users assigned successfully
 *       404:
 *         description: Organization not found
 */
router.post('/organizations/:organizationId/users', authMiddleware, adminMiddleware, adminController.assignUsersToOrganization);

/**
 * @swagger
 * /api/admin/organizations/{organizationId}/users:
 *   delete:
 *     summary: Remove users from an organization
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Users removed successfully
 *       404:
 *         description: Organization not found
 */
router.delete('/organizations/:organizationId/users', authMiddleware, adminMiddleware, adminController.removeUsersFromOrganization);

module.exports = router;
