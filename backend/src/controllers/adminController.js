const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');
const Review = require('../models/Review');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const role = req.query.role;
    const search = req.query.search;

    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
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

// @desc    Get all restaurants
// @route   GET /api/admin/restaurants
// @access  Private/Admin
exports.getRestaurants = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search;
    const isActive = req.query.isActive;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const restaurants = await Restaurant.find(filter)
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Restaurant.countDocuments(filter);

    res.json({
      success: true,
      data: {
        restaurants,
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

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
exports.getOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const filter = {};
    if (status) filter.orderStatus = status;

    const orders = await Order.find(filter)
      .populate('userId', 'name email')
      .populate('restaurantId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);

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

// @desc    Get admin analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
exports.getAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    // Total users
    const totalUsers = await User.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalRestaurants = await User.countDocuments({ role: 'restaurant' });

    // Total restaurants
    const totalRestaurantEntities = await Restaurant.countDocuments();
    const activeRestaurants = await Restaurant.countDocuments({ isActive: true });

    // Order statistics
    const totalOrders = await Order.countDocuments(dateFilter);
    const completedOrders = await Order.countDocuments({ ...dateFilter, orderStatus: 'Delivered' });
    const cancelledOrders = await Order.countDocuments({ ...dateFilter, orderStatus: 'Cancelled' });
    
    const orders = await Order.find(dateFilter);
    const totalRevenue = orders
      .filter(o => o.orderStatus === 'Delivered')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const averageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;

    // Review statistics
    const totalReviews = await Review.countDocuments(dateFilter);
    const reviews = await Review.find(dateFilter);
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    // Recent activity
    const recentOrders = await Order.find(dateFilter)
      .populate('userId', 'name')
      .populate('restaurantId', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        analytics: {
          users: {
            total: totalUsers,
            customers: totalCustomers,
            restaurants: totalRestaurants
          },
          restaurants: {
            total: totalRestaurantEntities,
            active: activeRestaurants,
            inactive: totalRestaurantEntities - activeRestaurants
          },
          orders: {
            total: totalOrders,
            completed: completedOrders,
            cancelled: cancelledOrders,
            totalRevenue,
            averageOrderValue
          },
          reviews: {
            total: totalReviews,
            averageRating
          },
          recentOrders
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      message: 'User status updated successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update restaurant status
// @route   PUT /api/admin/restaurants/:id/status
// @access  Private/Admin
exports.updateRestaurantStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    restaurant.isActive = isActive;
    await restaurant.save();

    res.json({
      success: true,
      message: 'Restaurant status updated successfully',
      data: { restaurant }
    });
  } catch (error) {
    next(error);
  }
};

