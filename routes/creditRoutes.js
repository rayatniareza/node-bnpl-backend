const express = require('express');
const router = express.Router();
const creditController = require('../controllers/creditController');
const authMiddleware = require('../middlewares/auth');

/**
 * @swagger
 * /api/credits/products:
 *   get:
 *     summary: Get eligible credit products for the current user
 *     tags: [Credits]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of eligible products
 *       401:
 *         description: Unauthorized
 */
router.get('/products', authMiddleware, creditController.getEligibleProducts);

module.exports = router;
