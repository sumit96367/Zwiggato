const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const {
  getRestaurants,
  getRestaurant,
  getRestaurantMenu,
  createRestaurant,
  updateRestaurant,
  getRestaurantAnalytics,
  getMyRestaurant
} = require('../controllers/restaurantController');

const router = express.Router();

// Public routes
router.get('/', getRestaurants);
// Specific routes must come before parameterized routes
router.get('/my-restaurant', auth, getMyRestaurant);
router.get('/:id/menu', getRestaurantMenu);
router.get('/:id', getRestaurant);

// Protected routes
// Allow restaurant owners to create their own restaurant, or admins to create for anyone
router.post('/', auth, [
  body('name').trim().notEmpty().withMessage('Restaurant name is required'),
  body('description').optional(),
  body('location.address').notEmpty().withMessage('Address is required'),
  body('location.city').notEmpty().withMessage('City is required'),
  body('location.state').notEmpty().withMessage('State is required'),
  body('location.zipCode').notEmpty().withMessage('Zip code is required')
], createRestaurant);

router.put('/:id', auth, [
  body('name').optional().trim().notEmpty(),
  body('description').optional()
], updateRestaurant);

router.get('/:id/analytics', auth, getRestaurantAnalytics);

module.exports = router;

