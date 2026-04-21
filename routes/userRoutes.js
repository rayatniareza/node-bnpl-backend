const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/auth');

/**
 * @swagger
 * /api/users/profile:
 *   post:
 *     summary: Create user profile (Initial KYC)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nationalId
 *               - birthDate
 *             properties:
 *               nationalId:
 *                 type: string
 *                 example: "1234567890"
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-01"
 *     responses:
 *       200:
 *         description: Profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 kycStatus:
 *                   type: string
 *                 kycLevel:
 *                   type: integer
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.post('/profile', authMiddleware, userController.createProfile);

module.exports = router;
