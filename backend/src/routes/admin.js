const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const {
  getUsers,
  getRestaurants,
  getOrders,
  getAnalytics,
  updateUserStatus,
  updateRestaurantStatus
} = require('../controllers/adminController');

const router = express.Router();

// All routes require admin authentication
router.use(auth);
router.use(authorize('admin'));

// Analytics
router.get('/analytics', getAnalytics);

// Users
router.get('/users', getUsers);
router.put('/users/:id/status', [
  body('isActive').isBoolean().withMessage('isActive must be a boolean')
], updateUserStatus);

// Restaurants
router.get('/restaurants', getRestaurants);
router.put('/restaurants/:id/status', [
  body('isActive').isBoolean().withMessage('isActive must be a boolean')
], updateRestaurantStatus);

// Orders
router.get('/orders', getOrders);

module.exports = router;

