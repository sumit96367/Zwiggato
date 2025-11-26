const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const {
  createOrder,
  getOrder,
  updateOrderStatus,
  getRestaurantOrders,
  cancelOrder,
  reorder
} = require('../controllers/orderController');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Validation rules
const createOrderValidation = [
  body('restaurantId').notEmpty().withMessage('Restaurant ID is required'),
  body('orderItems').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('orderItems.*.menuItemId').notEmpty().withMessage('Menu item ID is required'),
  body('orderItems.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('deliveryAddress.street').notEmpty().withMessage('Street address is required'),
  body('deliveryAddress.city').notEmpty().withMessage('City is required'),
  body('deliveryAddress.state').notEmpty().withMessage('State is required'),
  body('deliveryAddress.zipCode').notEmpty().withMessage('Zip code is required'),
  body('paymentMethod').isIn(['COD', 'Card', 'UPI', 'Wallet']).withMessage('Invalid payment method')
];

// Routes
router.post('/', authorize('customer'), createOrderValidation, createOrder);
router.get('/:id', getOrder);
router.put('/:id/status', authorize('restaurant', 'admin'), [
  body('status').isIn(['Restaurant Accepted', 'Preparing', 'Ready for Pickup', 'Out for Delivery', 'Delivered', 'Rejected']).withMessage('Invalid status')
], updateOrderStatus);
router.get('/restaurant/:restaurantId', authorize('restaurant', 'admin'), getRestaurantOrders);
router.post('/:id/reorder', reorder);
router.post('/:id/cancel', cancelOrder);

module.exports = router;

