const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
  getMenuItem
} = require('../controllers/menuController');

const router = express.Router();

// Public routes
router.get('/:id', getMenuItem);

// Protected routes
router.post('/', auth, [
  body('restaurantId').notEmpty().withMessage('Restaurant ID is required'),
  body('name').trim().notEmpty().withMessage('Menu item name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('category').notEmpty().withMessage('Category is required')
], createMenuItem);

router.put('/:id', auth, [
  body('name').optional().trim().notEmpty(),
  body('price').optional().isFloat({ min: 0 })
], updateMenuItem);

router.delete('/:id', auth, deleteMenuItem);
router.patch('/:id/availability', auth, toggleAvailability);

module.exports = router;

