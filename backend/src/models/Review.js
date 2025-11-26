const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  comment: {
    type: String,
    maxlength: [1000, 'Comment cannot be more than 1000 characters']
  },
  images: [{
    type: String // URLs to uploaded images
  }],
  deliveryRating: {
    type: Number,
    min: [1, 'Delivery rating must be at least 1'],
    max: [5, 'Delivery rating cannot be more than 5']
  },
  foodRating: {
    type: Number,
    min: [1, 'Food rating must be at least 1'],
    max: [5, 'Food rating cannot be more than 5']
  }
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ restaurantId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1 });
reviewSchema.index({ orderId: 1 }, { unique: true }); // One review per order

module.exports = mongoose.model('Review', reviewSchema);

