const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

// @desc    Create menu item
// @route   POST /api/menu
// @access  Private/Restaurant Owner
exports.createMenuItem = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const restaurant = await Restaurant.findById(req.body.restaurantId);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Check if user is owner or admin
    if (req.user.role !== 'admin' && restaurant.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add menu items to this restaurant'
      });
    }

    const menuItem = await MenuItem.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: { menuItem }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Private/Restaurant Owner
exports.updateMenuItem = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const menuItem = await MenuItem.findById(req.params.id).populate('restaurantId');

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && menuItem.restaurantId.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this menu item'
      });
    }

    Object.assign(menuItem, req.body);
    await menuItem.save();

    res.json({
      success: true,
      message: 'Menu item updated successfully',
      data: { menuItem }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Private/Restaurant Owner
exports.deleteMenuItem = async (req, res, next) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id).populate('restaurantId');

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && menuItem.restaurantId.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this menu item'
      });
    }

    await menuItem.deleteOne();

    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle menu item availability
// @route   PATCH /api/menu/:id/availability
// @access  Private/Restaurant Owner
exports.toggleAvailability = async (req, res, next) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id).populate('restaurantId');

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && menuItem.restaurantId.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    menuItem.isAvailable = !menuItem.isAvailable;
    await menuItem.save();

    res.json({
      success: true,
      message: `Menu item ${menuItem.isAvailable ? 'enabled' : 'disabled'}`,
      data: { menuItem }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get menu item by ID
// @route   GET /api/menu/:id
// @access  Public
exports.getMenuItem = async (req, res, next) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id).populate('restaurantId', 'name');

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    res.json({
      success: true,
      data: { menuItem }
    });
  } catch (error) {
    next(error);
  }
};

