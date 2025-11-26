const Coupon = require('../models/Coupon');
const Order = require('../models/Order');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

// @desc    Validate coupon code
// @route   POST /api/coupons/validate
// @access  Private
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, orderAmount, restaurantId } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required'
      });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code'
      });
    }

    // Check validity dates
    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return res.status(400).json({
        success: false,
        message: 'Coupon has expired'
      });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'Coupon usage limit reached'
      });
    }

    // Check minimum order amount
    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required`
      });
    }

    // Check if coupon is applicable to this restaurant
    if (coupon.applicableTo === 'restaurant' && coupon.restaurantId?.toString() !== restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'Coupon not applicable to this restaurant'
      });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = Math.min(coupon.discountValue, orderAmount);
    }

    res.json({
      success: true,
      data: {
        coupon: {
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue
        },
        discount: Math.round(discount * 100) / 100,
        finalAmount: Math.round((orderAmount - discount) * 100) / 100
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Apply coupon to order
// @route   POST /api/coupons/apply
// @access  Private
exports.applyCoupon = async (req, res, next) => {
  try {
    const { code, orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Validate coupon (reuse validation logic)
    const validationResult = await exports.validateCoupon(req, res, next);
    if (!validationResult) return;

    // Apply discount to order
    const discount = validationResult.data.discount;
    order.totalAmount = order.totalAmount - discount;
    order.couponCode = code.toUpperCase();
    order.discount = discount;
    await order.save();

    // Increment coupon usage
    await Coupon.findOneAndUpdate(
      { code: code.toUpperCase() },
      { $inc: { usedCount: 1 } }
    );

    res.json({
      success: true,
      message: 'Coupon applied successfully',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all active coupons
// @route   GET /api/coupons
// @access  Public
exports.getCoupons = async (req, res, next) => {
  try {
    const { restaurantId } = req.query;
    const now = new Date();

    const query = {
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now }
    };

    if (restaurantId) {
      query.$or = [
        { applicableTo: 'all' },
        { applicableTo: 'restaurant', restaurantId }
      ];
    }

    const coupons = await Coupon.find(query)
      .select('-usedCount')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { coupons }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create coupon (Admin only)
// @route   POST /api/coupons
// @access  Private/Admin
exports.createCoupon = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const coupon = await Coupon.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: { coupon }
    });
  } catch (error) {
    next(error);
  }
};

