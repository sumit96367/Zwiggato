const express = require('express');
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  getOrders,
  addAddress,
  updateAddress,
  deleteAddress,
  addFavorite,
  removeFavorite
} = require('../controllers/userController');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Validation rules
const updateProfileValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().matches(/^[0-9]{10}$/).withMessage('Please provide a valid 10-digit phone number')
];

const addressValidation = [
  body('street').trim().notEmpty().withMessage('Street is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('zipCode').trim().notEmpty().withMessage('Zip code is required')
];

// Routes
router.get('/profile', getProfile);
router.put('/profile', updateProfileValidation, updateProfile);
router.get('/orders', getOrders);
router.post('/address', addressValidation, addAddress);
router.put('/address/:addressId', addressValidation, updateAddress);
router.delete('/address/:addressId', deleteAddress);
router.post('/favorites', body('menuItemId').notEmpty(), addFavorite);
router.delete('/favorites/:menuItemId', removeFavorite);

module.exports = router;

