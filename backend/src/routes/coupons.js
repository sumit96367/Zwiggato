const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const {
  validateCoupon,
  applyCoupon,
  getCoupons,
  createCoupon
} = require('../controllers/couponController');

const router = express.Router();

// Public routes
router.get('/', getCoupons);

// Protected routes
router.post('/validate', auth, [
  body('code').notEmpty().withMessage('Coupon code is required'),
  body('orderAmount').isFloat({ min: 0 }).withMessage('Order amount must be a positive number')
], validateCoupon);

router.post('/apply', auth, [
  body('code').notEmpty().withMessage('Coupon code is required'),
  body('orderId').notEmpty().withMessage('Order ID is required')
], applyCoupon);

// Admin routes
router.post('/', auth, authorize('admin'), [
  body('code').notEmpty().withMessage('Coupon code is required'),
  body('discountType').isIn(['percentage', 'fixed']).withMessage('Invalid discount type'),
  body('discountValue').isFloat({ min: 0 }).withMessage('Discount value must be a positive number'),
  body('validFrom').isISO8601().withMessage('Valid from date is required'),
  body('validUntil').isISO8601().withMessage('Valid until date is required')
], createCoupon);

module.exports = router;

