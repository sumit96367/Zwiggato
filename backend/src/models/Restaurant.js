const mongoose = require('mongoose');

const operatingHoursSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  openTime: { type: String, required: true }, // Format: "HH:MM"
  closeTime: { type: String, required: true },
  isOpen: { type: Boolean, default: true }
});

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a restaurant name'],
    trim: true,
    maxlength: [100, 'Restaurant name cannot be more than 100 characters']
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  coverImage: {
    type: String,
    default: null
  },
  cuisineType: [{
    type: String,
    enum: [
      'Indian', 'Chinese', 'Italian', 'Mexican', 'Thai', 'Japanese', 'American', 
      'Continental', 'Fast Food', 'Desserts', 'Beverages', 'Other',
      'French', 'Korean', 'Filipino', 'Asian', 'European', 'Seafood', 'Mediterranean',
      'Brazilian', 'Pizza', 'Cafe', 'Arabian', 'Lebanese', 'Peruvian', 'Latin American',
      'Bar Food', 'International', 'Grill', 'Burger', 'Sushi', 'Ice Cream', 'Juices',
      'Healthy Food', 'Pasta', 'Steakhouse', 'Bakery', 'BBQ', 'Vegetarian', 'Vegan'
    ]
  }],
  deliveryTime: {
    type: Number,
    default: 30, // minutes
    min: [15, 'Delivery time must be at least 15 minutes']
  },
  minimumOrder: {
    type: Number,
    default: 0,
    min: [0, 'Minimum order cannot be negative']
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot be more than 5']
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },
  operatingHours: [operatingHoursSchema],
  commissionRate: {
    type: Number,
    default: 15, // percentage
    min: [0, 'Commission rate cannot be negative'],
    max: [100, 'Commission rate cannot be more than 100']
  }
}, {
  timestamps: true
});

// Index for search functionality
restaurantSchema.index({ name: 'text', description: 'text', cuisineType: 'text' });
restaurantSchema.index({ 'location.city': 1 });
restaurantSchema.index({ rating: -1 });

module.exports = mongoose.model('Restaurant', restaurantSchema);

