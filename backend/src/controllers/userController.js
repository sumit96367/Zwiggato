const User = require('../models/User');
const Order = require('../models/Order');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, phone, profileImage } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (phone) {
      // Check if phone is already taken by another user
      const existingUser = await User.findOne({ phone, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Phone number already in use'
        });
      }
      user.phone = phone;
    }
    if (profileImage) user.profileImage = profileImage;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user orders
// @route   GET /api/users/orders
// @access  Private
exports.getOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ userId: req.user.id })
      .populate('restaurantId', 'name coverImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments({ userId: req.user.id });

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add delivery address
// @route   POST /api/users/address
// @access  Private
exports.addAddress = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { street, city, state, zipCode, country, isDefault, label } = req.body;
    const user = await User.findById(req.user.id);

    // If this is set as default, unset other defaults
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    user.addresses.push({
      street,
      city,
      state,
      zipCode,
      country: country || 'India',
      isDefault: isDefault || false,
      label: label || 'Home'
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: { addresses: user.addresses }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update delivery address
// @route   PUT /api/users/address/:addressId
// @access  Private
exports.updateAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const { street, city, state, zipCode, country, isDefault, label } = req.body;
    const user = await User.findById(req.user.id);

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    if (street) address.street = street;
    if (city) address.city = city;
    if (state) address.state = state;
    if (zipCode) address.zipCode = zipCode;
    if (country) address.country = country;
    if (label) address.label = label;

    // If setting as default, unset others
    if (isDefault) {
      user.addresses.forEach(addr => {
        if (addr._id.toString() !== addressId) {
          addr.isDefault = false;
        }
      });
      address.isDefault = true;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: { addresses: user.addresses }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete delivery address
// @route   DELETE /api/users/address/:addressId
// @access  Private
exports.deleteAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user.id);

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    user.addresses.pull(addressId);
    await user.save();

    res.json({
      success: true,
      message: 'Address deleted successfully',
      data: { addresses: user.addresses }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add favorite dish
// @route   POST /api/users/favorites
// @access  Private
exports.addFavorite = async (req, res, next) => {
  try {
    const { menuItemId } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.favoriteDishes.includes(menuItemId)) {
      user.favoriteDishes.push(menuItemId);
      await user.save();
    }

    res.json({
      success: true,
      message: 'Added to favorites',
      data: { favoriteDishes: user.favoriteDishes }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove favorite dish
// @route   DELETE /api/users/favorites/:menuItemId
// @access  Private
exports.removeFavorite = async (req, res, next) => {
  try {
    const { menuItemId } = req.params;
    const user = await User.findById(req.user.id);

    user.favoriteDishes.pull(menuItemId);
    await user.save();

    res.json({
      success: true,
      message: 'Removed from favorites',
      data: { favoriteDishes: user.favoriteDishes }
    });
  } catch (error) {
    next(error);
  }
};

