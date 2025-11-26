const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot be more than 200 characters']
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true,
    min: [0, 'Discount value cannot be negative']
  },
  minOrderAmount: {
    type: Number,
    default: 0,
    min: [0, 'Minimum order amount cannot be negative']
  },
  maxDiscount: {
    type: Number,
    default: null // For percentage discounts, maximum discount cap
  },
  validFrom: {
    type: Date,
    required: true
  },
  validUntil: {
    type: Date,
    required: true
  },
  usageLimit: {
    type: Number,
    default: null // null means unlimited
  },
  usedCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicableTo: {
    type: String,
    enum: ['all', 'restaurant', 'category'],
    default: 'all'
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    default: null
  },
  cuisineTypes: [{
    type: String
  }]
}, {
  timestamps: true
});

// Index for quick lookup
couponSchema.index({ code: 1, isActive: 1 });
couponSchema.index({ validFrom: 1, validUntil: 1 });

module.exports = mongoose.model('Coupon', couponSchema);

