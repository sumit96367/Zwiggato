const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const Review = require('../models/Review');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

// @desc    Get all restaurants with filters
// @route   GET /api/restaurants
// @access  Public
exports.getRestaurants = async (req, res, next) => {
  try {
    const {
      search,
      cuisineType,
      minRating,
      maxDeliveryTime,
      city,
      page = 1,
      limit = 10
    } = req.query;

    const query = { isActive: true };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Search by name or description
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by cuisine type
    if (cuisineType) {
      query.cuisineType = { $in: Array.isArray(cuisineType) ? cuisineType : [cuisineType] };
    }

    // Filter by minimum rating
    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    // Filter by maximum delivery time
    if (maxDeliveryTime) {
      query.deliveryTime = { $lte: parseInt(maxDeliveryTime) };
    }

    // Filter by city
    if (city) {
      query['location.city'] = new RegExp(city, 'i');
    }

    const restaurants = await Restaurant.find(query)
      .select('-ownerId')
      .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1, rating: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Restaurant.countDocuments(query);

    res.json({
      success: true,
      data: {
        restaurants,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get restaurant by ID
// @route   GET /api/restaurants/:id
// @access  Public
exports.getRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate('ownerId', 'name email phone')
      .select('-ownerId.password');

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    res.json({
      success: true,
      data: { restaurant }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get restaurant menu
// @route   GET /api/restaurants/:id/menu
// @access  Public
exports.getRestaurantMenu = async (req, res, next) => {
  try {
    const { category, available } = req.query;
    const query = { restaurantId: req.params.id };

    if (category) {
      query.category = category;
    }

    if (available !== undefined) {
      query.isAvailable = available === 'true';
    }

    const menuItems = await MenuItem.find(query).sort({ category: 1, name: 1 });

    // Group by category
    const menuByCategory = menuItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        menuItems,
        menuByCategory
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create restaurant
// @route   POST /api/restaurants
// @access  Private/Restaurant Owner or Admin
exports.createRestaurant = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Check if user already has a restaurant (unless admin)
    if (req.user.role === 'restaurant') {
      const existingRestaurant = await Restaurant.findOne({ ownerId: req.user.id });
      if (existingRestaurant) {
        return res.status(400).json({
          success: false,
          message: 'You already have a restaurant associated with your account'
        });
      }
    }

    const restaurantData = req.body;
    // Restaurant owners can only create for themselves, admins can specify ownerId
    if (req.user.role === 'restaurant') {
      restaurantData.ownerId = req.user.id;
    } else if (req.user.role === 'admin') {
      restaurantData.ownerId = req.body.ownerId || req.user.id;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Only restaurant owners and admins can create restaurants'
      });
    }

    const restaurant = await Restaurant.create(restaurantData);

    res.status(201).json({
      success: true,
      message: 'Restaurant created successfully',
      data: { restaurant }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update restaurant
// @route   PUT /api/restaurants/:id
// @access  Private/Restaurant Owner or Admin
exports.updateRestaurant = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const restaurant = await Restaurant.findById(req.params.id);

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
        message: 'Not authorized to update this restaurant'
      });
    }

    Object.assign(restaurant, req.body);
    await restaurant.save();

    res.json({
      success: true,
      message: 'Restaurant updated successfully',
      data: { restaurant }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get restaurant analytics
// @route   GET /api/restaurants/:id/analytics
// @access  Private/Restaurant Owner or Admin
exports.getRestaurantAnalytics = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && restaurant.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const { startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Get orders
    const orders = await Order.find({
      restaurantId: req.params.id,
      ...dateFilter
    });

    // Calculate analytics
    const totalRevenue = orders
      .filter(o => o.paymentStatus === 'Completed')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.orderStatus === 'Delivered').length;
    const cancelledOrders = orders.filter(o => o.orderStatus === 'Cancelled').length;

    // Popular dishes
    const dishCounts = {};
    orders.forEach(order => {
      order.orderItems.forEach(item => {
        dishCounts[item.name] = (dishCounts[item.name] || 0) + item.quantity;
      });
    });
    const popularDishes = Object.entries(dishCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // Get reviews
    const reviews = await Review.find({ restaurantId: req.params.id, ...dateFilter });
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    res.json({
      success: true,
      data: {
        analytics: {
          totalRevenue,
          totalOrders,
          completedOrders,
          cancelledOrders,
          averageOrderValue: totalOrders > 0 ? totalRevenue / completedOrders : 0,
          completionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
          averageRating: avgRating,
          totalReviews: reviews.length,
          popularDishes
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get restaurant for current user (restaurant owner)
// @route   GET /api/restaurants/my-restaurant
// @access  Private/Restaurant Owner
exports.getMyRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findOne({ ownerId: req.user.id });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'No restaurant found for this user'
      });
    }

    res.json({
      success: true,
      data: { restaurant }
    });
  } catch (error) {
    next(error);
  }
};

