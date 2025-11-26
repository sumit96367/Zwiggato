const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  specialInstructions: { type: String, maxlength: 200 }
}, { _id: true });

const orderSchema = new mongoose.Schema({
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
  orderItems: [orderItemSchema],
  deliveryAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'India' },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },
  orderStatus: {
    type: String,
    enum: ['Order Placed', 'Restaurant Accepted', 'Preparing', 'Ready for Pickup', 'Out for Delivery', 'Delivered', 'Cancelled', 'Rejected'],
    default: 'Order Placed'
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  deliveryCharges: {
    type: Number,
    default: 0,
    min: [0, 'Delivery charges cannot be negative']
  },
  tax: {
    type: Number,
    default: 0,
    min: [0, 'Tax cannot be negative']
  },
  couponCode: {
    type: String,
    default: null
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative']
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'Card', 'UPI', 'Wallet'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  specialInstructions: {
    type: String,
    maxlength: [500, 'Special instructions cannot be more than 500 characters']
  },
  estimatedDeliveryTime: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  cancellationReason: {
    type: String,
    maxlength: [200, 'Cancellation reason cannot be more than 200 characters']
  },
  rejectionReason: {
    type: String,
    maxlength: [200, 'Rejection reason cannot be more than 200 characters']
  }
}, {
  timestamps: true
});

// Indexes
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ restaurantId: 1, orderStatus: 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);

