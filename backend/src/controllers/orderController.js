const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const { createNotification } = require('./notificationController');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private/Customer
exports.createOrder = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { restaurantId, orderItems, deliveryAddress, paymentMethod, specialInstructions } = req.body;

    // Verify restaurant exists and is active
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant || !restaurant.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found or inactive'
      });
    }

    // Validate and calculate order items
    let subtotal = 0;
    const validatedItems = [];

    for (const item of orderItems) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: `Menu item ${item.menuItemId} not found`
        });
      }

      if (!menuItem.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `Menu item ${menuItem.name} is not available`
        });
      }

      const itemTotal = menuItem.price * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        menuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions
      });
    }

    // Check minimum order
    if (subtotal < restaurant.minimumOrder) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is ₹${restaurant.minimumOrder}`
      });
    }

    // Calculate charges
    const deliveryCharges = 30; // Fixed delivery charge
    const tax = subtotal * 0.18; // 18% GST
    
    // Apply coupon discount if provided
    let discount = 0;
    let couponCode = null;
    if (req.body.couponCode) {
      // Coupon validation should be done before order creation
      // For now, we'll apply it here
      couponCode = req.body.couponCode;
      // Discount calculation will be handled by coupon validation
      discount = req.body.discount || 0;
    }
    
    const totalAmount = subtotal + deliveryCharges + tax - discount;

    // Calculate estimated delivery time
    const estimatedDeliveryTime = new Date();
    estimatedDeliveryTime.setMinutes(estimatedDeliveryTime.getMinutes() + restaurant.deliveryTime);

    // Create order
    const order = await Order.create({
      userId: req.user.id,
      restaurantId,
      orderItems: validatedItems,
      deliveryAddress,
      totalAmount,
      deliveryCharges,
      tax,
      discount,
      couponCode,
      paymentMethod,
      specialInstructions,
      estimatedDeliveryTime,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Completed'
    });

    // Populate restaurant details
    await order.populate('restaurantId', 'name coverImage');

    // Create notification for order placed
    await createNotification(
      req.user.id,
      'order_placed',
      'Order Placed Successfully!',
      `Your order #${order._id.toString().slice(-6)} has been placed.`,
      { orderId: order._id, actionUrl: `/orders/${order._id}` }
    );

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('restaurantId', 'name coverImage location');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && 
        order.userId._id.toString() !== req.user.id &&
        (req.user.role !== 'restaurant' || order.restaurantId._id.toString() !== req.user.restaurantId?.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Restaurant Owner or Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    const order = await Order.findById(req.params.id).populate('restaurantId');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && order.restaurantId.ownerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    // Validate status transition
    const validTransitions = {
      'Order Placed': ['Restaurant Accepted', 'Rejected'],
      'Restaurant Accepted': ['Preparing', 'Cancelled'],
      'Preparing': ['Ready for Pickup'],
      'Ready for Pickup': ['Out for Delivery'],
      'Out for Delivery': ['Delivered']
    };

    if (!validTransitions[order.orderStatus]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${order.orderStatus} to ${status}`
      });
    }

    order.orderStatus = status;
    if (status === 'Rejected' && rejectionReason) {
      order.rejectionReason = rejectionReason;
    }
    if (status === 'Delivered') {
      order.deliveredAt = new Date();
      order.paymentStatus = 'Completed';
    }

    await order.save();

    // Create notification for status change
    const statusMessages = {
      'Restaurant Accepted': 'Your order has been accepted by the restaurant!',
      'Preparing': 'Your order is being prepared.',
      'Ready for Pickup': 'Your order is ready for pickup!',
      'Out for Delivery': 'Your order is out for delivery!',
      'Delivered': 'Your order has been delivered. Enjoy your meal!',
      'Rejected': 'Your order has been rejected by the restaurant.'
    };

    if (statusMessages[status]) {
      await createNotification(
        order.userId,
        `order_${status.toLowerCase().replace(/\s+/g, '_')}`,
        `Order ${status}`,
        statusMessages[status],
        { orderId: order._id, restaurantId: order.restaurantId._id || order.restaurantId, actionUrl: `/orders/${order._id}` }
      );
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get restaurant orders
// @route   GET /api/orders/restaurant/:restaurantId
// @access  Private/Restaurant Owner or Admin
exports.getRestaurantOrders = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const restaurant = await Restaurant.findById(restaurantId);
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

    const query = { restaurantId };
    if (status) {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .populate('userId', 'name phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
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

// @desc    Reorder previous order
// @route   POST /api/orders/:id/reorder
// @access  Private
exports.reorder = async (req, res, next) => {
  try {
    const previousOrder = await Order.findById(req.params.id);

    if (!previousOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && previousOrder.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to reorder this order'
      });
    }

    // Verify restaurant is still active
    const restaurant = await Restaurant.findById(previousOrder.restaurantId);
    if (!restaurant || !restaurant.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant is no longer available'
      });
    }

    // Recalculate prices (in case menu items changed)
    let subtotal = 0;
    const validatedItems = [];

    for (const item of previousOrder.orderItems) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem || !menuItem.isAvailable) {
        continue; // Skip unavailable items
      }

      const itemTotal = menuItem.price * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        menuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions
      });
    }

    if (validatedItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items available for reorder'
      });
    }

    // Check minimum order
    if (subtotal < restaurant.minimumOrder) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is ₹${restaurant.minimumOrder}`
      });
    }

    // Calculate charges
    const deliveryCharges = 30;
    const tax = subtotal * 0.18;
    const totalAmount = subtotal + deliveryCharges + tax;

    // Create new order
    const newOrder = await Order.create({
      userId: req.user.id,
      restaurantId: previousOrder.restaurantId,
      orderItems: validatedItems,
      deliveryAddress: previousOrder.deliveryAddress,
      totalAmount,
      deliveryCharges,
      tax,
      discount: 0, // Reset discount for reorder
      paymentMethod: previousOrder.paymentMethod,
      specialInstructions: previousOrder.specialInstructions,
      estimatedDeliveryTime: new Date(Date.now() + restaurant.deliveryTime * 60000),
      paymentStatus: previousOrder.paymentMethod === 'COD' ? 'Pending' : 'Completed'
    });

    await newOrder.populate('restaurantId', 'name coverImage');

    // Create notification
    await createNotification(
      req.user.id,
      'order_placed',
      'Order Reordered!',
      `Your previous order has been reordered. Order #${newOrder._id.toString().slice(-6)}`,
      { orderId: newOrder._id, actionUrl: `/orders/${newOrder._id}` }
    );

    res.status(201).json({
      success: true,
      message: 'Order reordered successfully',
      data: { order: newOrder }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   POST /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
  try {
    const { cancellationReason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && order.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Check if order can be cancelled
    const cancellableStatuses = ['Order Placed', 'Restaurant Accepted', 'Preparing'];
    if (!cancellableStatuses.includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled in ${order.orderStatus} status`
      });
    }

    order.orderStatus = 'Cancelled';
    if (cancellationReason) {
      order.cancellationReason = cancellationReason;
    }
    if (order.paymentStatus === 'Completed') {
      order.paymentStatus = 'Refunded';
    }

    await order.save();

    // Create notification
    await createNotification(
      order.userId,
      'order_cancelled',
      'Order Cancelled',
      `Your order #${order._id.toString().slice(-6)} has been cancelled.`,
      { orderId: order._id, actionUrl: `/orders/${order._id}` }
    );

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

