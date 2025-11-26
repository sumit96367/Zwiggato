const Review = require('../models/Review');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

// @desc    Submit review
// @route   POST /api/reviews
// @access  Private/Customer
exports.submitReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { restaurantId, orderId, rating, comment, images, deliveryRating, foodRating } = req.body;

    // Verify order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this order'
      });
    }

    if (order.restaurantId.toString() !== restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'Order does not belong to this restaurant'
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({ orderId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Review already exists for this order'
      });
    }

    // Create review
    const review = await Review.create({
      userId: req.user.id,
      restaurantId,
      orderId,
      rating,
      comment,
      images: images || [],
      deliveryRating,
      foodRating
    });

    // Update restaurant rating
    await updateRestaurantRating(restaurantId);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: { review }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get restaurant reviews
// @route   GET /api/reviews/restaurant/:restaurantId
// @access  Public
exports.getRestaurantReviews = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({ restaurantId })
      .populate('userId', 'name profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ restaurantId });

    res.json({
      success: true,
      data: {
        reviews,
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

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private/Customer
exports.updateReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && review.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    const { rating, comment, images, deliveryRating, foodRating } = req.body;
    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    if (images) review.images = images;
    if (deliveryRating) review.deliveryRating = deliveryRating;
    if (foodRating) review.foodRating = foodRating;

    await review.save();

    // Update restaurant rating
    await updateRestaurantRating(review.restaurantId);

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: { review }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private/Customer or Admin
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && review.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    const restaurantId = review.restaurantId;
    await review.deleteOne();

    // Update restaurant rating
    await updateRestaurantRating(restaurantId);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to update restaurant rating
async function updateRestaurantRating(restaurantId) {
  const reviews = await Review.find({ restaurantId });
  if (reviews.length === 0) return;

  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  await Restaurant.findByIdAndUpdate(restaurantId, {
    rating: Math.round(avgRating * 10) / 10,
    totalReviews: reviews.length
  });
}

