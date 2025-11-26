const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const Review = require('../models/Review');
const User = require('../models/User');
const logger = require('../utils/logger');

// @desc    Get personalized restaurant recommendations
// @route   GET /api/recommendations
// @access  Private
exports.getRecommendations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    // Get user's order history
    const userOrders = await Order.find({ userId })
      .populate('restaurantId', 'cuisineType')
      .sort({ createdAt: -1 })
      .limit(20);

    // Analyze user preferences
    const cuisinePreferences = {};
    userOrders.forEach(order => {
      if (order.restaurantId?.cuisineType) {
        order.restaurantId.cuisineType.forEach(cuisine => {
          cuisinePreferences[cuisine] = (cuisinePreferences[cuisine] || 0) + 1;
        });
      }
    });

    // Get top preferred cuisines
    const topCuisines = Object.entries(cuisinePreferences)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cuisine]) => cuisine);

    // Get user's favorite restaurants (from reviews)
    const userReviews = await Review.find({ userId })
      .select('restaurantId rating')
      .populate('restaurantId', 'cuisineType');
    
    const favoriteRestaurantIds = userReviews
      .filter(review => review.rating >= 4)
      .map(review => review.restaurantId._id);

    // Build recommendation query
    const query = { isActive: true };
    
    if (topCuisines.length > 0) {
      query.cuisineType = { $in: topCuisines };
    }

    // Get recommended restaurants
    let recommendations = await Restaurant.find(query)
      .select('-ownerId')
      .sort({ rating: -1, totalReviews: -1 })
      .limit(limit * 2);

    // Prioritize restaurants with preferred cuisines and high ratings
    recommendations = recommendations
      .map(restaurant => {
        let score = restaurant.rating;
        
        // Boost score for preferred cuisines
        if (topCuisines.some(cuisine => restaurant.cuisineType.includes(cuisine))) {
          score += 0.5;
        }
        
        // Boost score for previously ordered restaurants
        if (userOrders.some(order => order.restaurantId._id.toString() === restaurant._id.toString())) {
          score += 0.3;
        }
        
        // Boost score for highly rated restaurants
        if (restaurant.rating >= 4.5) {
          score += 0.2;
        }

        return { restaurant, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.restaurant);

    // If not enough recommendations, add popular restaurants
    if (recommendations.length < limit) {
      const popularRestaurants = await Restaurant.find({
        isActive: true,
        _id: { $nin: recommendations.map(r => r._id) }
      })
      .select('-ownerId')
      .sort({ rating: -1, totalReviews: -1 })
      .limit(limit - recommendations.length);

      recommendations = [...recommendations, ...popularRestaurants];
    }

    res.json({
      success: true,
      data: {
        recommendations,
        preferences: {
          topCuisines,
          favoriteRestaurants: favoriteRestaurantIds.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get trending restaurants
// @route   GET /api/restaurants/trending
// @access  Public
exports.getTrendingRestaurants = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const days = parseInt(req.query.days) || 7;

    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    // Get restaurants with recent orders
    const recentOrders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: dateThreshold },
          orderStatus: { $ne: 'Cancelled' }
        }
      },
      {
        $group: {
          _id: '$restaurantId',
          orderCount: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { orderCount: -1, totalRevenue: -1 }
      },
      {
        $limit: limit
      }
    ]);

    const restaurantIds = recentOrders.map(item => item._id);

    const restaurants = await Restaurant.find({
      _id: { $in: restaurantIds },
      isActive: true
    })
    .select('-ownerId')
    .sort({ rating: -1 });

    // Sort by order count
    const sortedRestaurants = restaurantIds.map(id =>
      restaurants.find(r => r._id.toString() === id.toString())
    ).filter(Boolean);

    res.json({
      success: true,
      data: { restaurants: sortedRestaurants }
    });
  } catch (error) {
    next(error);
  }
};

