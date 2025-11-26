const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const {
  submitReview,
  getRestaurantReviews,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');

const router = express.Router();

// Public routes
router.get('/restaurant/:restaurantId', getRestaurantReviews);

// Protected routes
router.post('/', auth, authorize('customer'), [
  body('restaurantId').notEmpty().withMessage('Restaurant ID is required'),
  body('orderId').notEmpty().withMessage('Order ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
], submitReview);

router.put('/:id', auth, [
  body('rating').optional().isInt({ min: 1, max: 5 })
], updateReview);

router.delete('/:id', auth, deleteReview);

module.exports = router;

