const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth');

/**
 * @swagger
 * /api/auth/request-otp:
 *   post:
 *     summary: Request an OTP for a mobile number
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mobile
 *             properties:
 *               mobile:
 *                 type: string
 *                 example: "09123456789"
 *     responses:
 *       200:
 *         description: OTP requested successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 expiresIn:
 *                   type: integer
 *                   example: 120
 *       400:
 *         description: Invalid mobile number format
 */
router.post('/request-otp', authController.requestOtp);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP and login/register
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mobile
 *               - code
 *             properties:
 *               mobile:
 *                 type: string
 *                 example: "09123456789"
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 isNewUser:
 *                   type: boolean
 *       401:
 *         description: Invalid OTP or mobile
 */
router.post('/verify-otp', authController.verifyOtp);


// /**
//  * @swagger
//  * /api/auth/register:
//  *   post:
//  *     summary: Register a new user (Traditional)
//  *     tags: [Auth]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - userId
//  *               - mobile
//  *             properties:
//  *               userId:
//  *                 type: string
//  *                 example: u_1
//  *               mobile:
//  *                 type: string
//  *                 example: "09123456789"
//  *     responses:
//  *       201:
//  *         description: User created successfully
//  *       400:
//  *         description: User already exists
//  */
// router.post('/register', authController.register);

// /**
//  * @swagger
//  * /api/auth/login:
//  *   post:
//  *     summary: Login with mobile and OTP code (Traditional/Hardcoded)
//  *     tags: [Auth]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - mobile
//  *               - code
//  *             properties:
//  *               mobile:
//  *                 type: string
//  *                 example: "09123456789"
//  *               code:
//  *                 type: string
//  *                 example: "123456"
//  *     responses:
//  *       200:
//  *         description: Successful login
//  *       401:
//  *         description: Invalid OTP or mobile
//  */
// router.post('/login', authController.login);

// /**
//  * @swagger
//  * /api/auth/me:
//  *   get:
//  *     summary: Get current user details
//  *     tags: [Auth]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: User details fetched successfully
//  *       401:
//  *         description: Invalid token or user not authenticated
//  */
// router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
