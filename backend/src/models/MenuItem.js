const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a menu item name'],
    trim: true,
    maxlength: [100, 'Menu item name cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    enum: ['Appetizer', 'Main Course', 'Dessert', 'Beverage', 'Salad', 'Soup', 'Bread', 'Other'],
    required: true
  },
  image: {
    type: String,
    default: null
  },
  dietaryTags: [{
    type: String,
    enum: ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Spicy', 'Healthy']
  }],
  isAvailable: {
    type: Boolean,
    default: true
  },
  preparationTime: {
    type: Number,
    default: 15, // minutes
    min: [0, 'Preparation time cannot be negative']
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
menuItemSchema.index({ restaurantId: 1, category: 1 });
menuItemSchema.index({ isAvailable: 1 });
menuItemSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('MenuItem', menuItemSchema);

