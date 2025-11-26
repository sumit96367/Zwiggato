const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

const sampleRestaurants = [
  {
    name: 'Pizza Paradise',
    description: 'Authentic Italian pizzas with fresh ingredients and traditional recipes',
    cuisineType: ['Italian', 'Fast Food'],
    deliveryTime: 30,
    minimumOrder: 200,
    location: {
      address: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      coordinates: {
        latitude: 19.0760,
        longitude: 72.8777
      }
    },
    operatingHours: [
      { day: 'Monday', openTime: '11:00', closeTime: '23:00', isOpen: true },
      { day: 'Tuesday', openTime: '11:00', closeTime: '23:00', isOpen: true },
      { day: 'Wednesday', openTime: '11:00', closeTime: '23:00', isOpen: true },
      { day: 'Thursday', openTime: '11:00', closeTime: '23:00', isOpen: true },
      { day: 'Friday', openTime: '11:00', closeTime: '23:00', isOpen: true },
      { day: 'Saturday', openTime: '11:00', closeTime: '23:00', isOpen: true },
      { day: 'Sunday', openTime: '12:00', closeTime: '22:00', isOpen: true }
    ]
  },
  {
    name: 'Spice Garden',
    description: 'Delicious North Indian cuisine with a modern twist',
    cuisineType: ['Indian'],
    deliveryTime: 35,
    minimumOrder: 150,
    location: {
      address: '456 Park Avenue',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400002',
      coordinates: {
        latitude: 19.0760,
        longitude: 72.8777
      }
    },
    operatingHours: [
      { day: 'Monday', openTime: '12:00', closeTime: '23:00', isOpen: true },
      { day: 'Tuesday', openTime: '12:00', closeTime: '23:00', isOpen: true },
      { day: 'Wednesday', openTime: '12:00', closeTime: '23:00', isOpen: true },
      { day: 'Thursday', openTime: '12:00', closeTime: '23:00', isOpen: true },
      { day: 'Friday', openTime: '12:00', closeTime: '23:00', isOpen: true },
      { day: 'Saturday', openTime: '12:00', closeTime: '23:00', isOpen: true },
      { day: 'Sunday', openTime: '12:00', closeTime: '22:00', isOpen: true }
    ]
  },
  {
    name: 'Dragon Wok',
    description: 'Authentic Chinese cuisine with fresh ingredients',
    cuisineType: ['Chinese'],
    deliveryTime: 25,
    minimumOrder: 180,
    location: {
      address: '789 Market Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400003',
      coordinates: {
        latitude: 19.0760,
        longitude: 72.8777
      }
    },
    operatingHours: [
      { day: 'Monday', openTime: '11:00', closeTime: '22:00', isOpen: true },
      { day: 'Tuesday', openTime: '11:00', closeTime: '22:00', isOpen: true },
      { day: 'Wednesday', openTime: '11:00', closeTime: '22:00', isOpen: true },
      { day: 'Thursday', openTime: '11:00', closeTime: '22:00', isOpen: true },
      { day: 'Friday', openTime: '11:00', closeTime: '22:00', isOpen: true },
      { day: 'Saturday', openTime: '11:00', closeTime: '22:00', isOpen: true },
      { day: 'Sunday', openTime: '12:00', closeTime: '21:00', isOpen: true }
    ]
  },
  {
    name: 'Burger Junction',
    description: 'Juicy burgers and crispy fries made with premium ingredients',
    cuisineType: ['American', 'Fast Food'],
    deliveryTime: 20,
    minimumOrder: 100,
    location: {
      address: '321 Food Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400004',
      coordinates: {
        latitude: 19.0760,
        longitude: 72.8777
      }
    },
    operatingHours: [
      { day: 'Monday', openTime: '10:00', closeTime: '23:00', isOpen: true },
      { day: 'Tuesday', openTime: '10:00', closeTime: '23:00', isOpen: true },
      { day: 'Wednesday', openTime: '10:00', closeTime: '23:00', isOpen: true },
      { day: 'Thursday', openTime: '10:00', closeTime: '23:00', isOpen: true },
      { day: 'Friday', openTime: '10:00', closeTime: '23:00', isOpen: true },
      { day: 'Saturday', openTime: '10:00', closeTime: '23:00', isOpen: true },
      { day: 'Sunday', openTime: '10:00', closeTime: '22:00', isOpen: true }
    ]
  },
  {
    name: 'Sweet Dreams',
    description: 'Delicious desserts, cakes, and ice creams',
    cuisineType: ['Desserts'],
    deliveryTime: 15,
    minimumOrder: 80,
    location: {
      address: '555 Sweet Avenue',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400005',
      coordinates: {
        latitude: 19.0760,
        longitude: 72.8777
      }
    },
    operatingHours: [
      { day: 'Monday', openTime: '12:00', closeTime: '22:00', isOpen: true },
      { day: 'Tuesday', openTime: '12:00', closeTime: '22:00', isOpen: true },
      { day: 'Wednesday', openTime: '12:00', closeTime: '22:00', isOpen: true },
      { day: 'Thursday', openTime: '12:00', closeTime: '22:00', isOpen: true },
      { day: 'Friday', openTime: '12:00', closeTime: '22:00', isOpen: true },
      { day: 'Saturday', openTime: '12:00', closeTime: '22:00', isOpen: true },
      { day: 'Sunday', openTime: '12:00', closeTime: '21:00', isOpen: true }
    ]
  }
];

const sampleMenuItems = {
  'Pizza Paradise': [
    { name: 'Margherita Pizza', description: 'Classic pizza with tomato sauce, mozzarella, and basil', price: 299, category: 'Main Course', dietaryTags: ['Vegetarian'] },
    { name: 'Pepperoni Pizza', description: 'Spicy pepperoni with mozzarella cheese', price: 399, category: 'Main Course', dietaryTags: ['Non-Vegetarian'] },
    { name: 'Veggie Supreme', description: 'Loaded with bell peppers, mushrooms, onions, and olives', price: 349, category: 'Main Course', dietaryTags: ['Vegetarian'] },
    { name: 'Garlic Bread', description: 'Crispy bread with garlic butter', price: 149, category: 'Bread', dietaryTags: ['Vegetarian'] },
    { name: 'Caesar Salad', description: 'Fresh romaine lettuce with caesar dressing', price: 199, category: 'Salad', dietaryTags: ['Vegetarian'] }
  ],
  'Spice Garden': [
    { name: 'Butter Chicken', description: 'Creamy tomato-based curry with tender chicken', price: 349, category: 'Main Course', dietaryTags: ['Non-Vegetarian', 'Spicy'] },
    { name: 'Paneer Tikka', description: 'Grilled cottage cheese with spices', price: 279, category: 'Appetizer', dietaryTags: ['Vegetarian'] },
    { name: 'Dal Makhani', description: 'Creamy black lentils cooked overnight', price: 199, category: 'Main Course', dietaryTags: ['Vegetarian'] },
    { name: 'Naan', description: 'Fresh baked Indian bread', price: 49, category: 'Bread', dietaryTags: ['Vegetarian'] },
    { name: 'Biryani', description: 'Fragrant basmati rice with spices and meat', price: 299, category: 'Main Course', dietaryTags: ['Non-Vegetarian', 'Spicy'] }
  ],
  'Dragon Wok': [
    { name: 'Chicken Fried Rice', description: 'Stir-fried rice with chicken and vegetables', price: 249, category: 'Main Course', dietaryTags: ['Non-Vegetarian'] },
    { name: 'Veg Spring Rolls', description: 'Crispy vegetable spring rolls', price: 149, category: 'Appetizer', dietaryTags: ['Vegetarian'] },
    { name: 'Sweet and Sour Chicken', description: 'Tender chicken in tangy sauce', price: 329, category: 'Main Course', dietaryTags: ['Non-Vegetarian'] },
    { name: 'Manchurian', description: 'Spicy vegetable balls in tangy sauce', price: 199, category: 'Main Course', dietaryTags: ['Vegetarian', 'Spicy'] },
    { name: 'Hakka Noodles', description: 'Stir-fried noodles with vegetables', price: 179, category: 'Main Course', dietaryTags: ['Vegetarian'] }
  ],
  'Burger Junction': [
    { name: 'Classic Burger', description: 'Beef patty with lettuce, tomato, and special sauce', price: 199, category: 'Main Course', dietaryTags: ['Non-Vegetarian'] },
    { name: 'Veg Burger', description: 'Crispy vegetable patty with fresh veggies', price: 149, category: 'Main Course', dietaryTags: ['Vegetarian'] },
    { name: 'Chicken Burger', description: 'Grilled chicken patty with mayo', price: 229, category: 'Main Course', dietaryTags: ['Non-Vegetarian'] },
    { name: 'French Fries', description: 'Crispy golden fries', price: 99, category: 'Appetizer', dietaryTags: ['Vegetarian'] },
    { name: 'Onion Rings', description: 'Crispy battered onion rings', price: 119, category: 'Appetizer', dietaryTags: ['Vegetarian'] }
  ],
  'Sweet Dreams': [
    { name: 'Chocolate Cake', description: 'Rich chocolate cake with frosting', price: 249, category: 'Dessert', dietaryTags: ['Vegetarian'] },
    { name: 'Ice Cream Sundae', description: 'Vanilla ice cream with chocolate sauce', price: 149, category: 'Dessert', dietaryTags: ['Vegetarian'] },
    { name: 'Cheesecake', description: 'Creamy New York style cheesecake', price: 279, category: 'Dessert', dietaryTags: ['Vegetarian'] },
    { name: 'Brownie', description: 'Fudgy chocolate brownie', price: 129, category: 'Dessert', dietaryTags: ['Vegetarian'] },
    { name: 'Milkshake', description: 'Thick and creamy milkshake', price: 149, category: 'Beverage', dietaryTags: ['Vegetarian'] }
  ]
};

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zwiggato');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});
    console.log('Cleared existing data');

    // Create a restaurant owner user if it doesn't exist
    let restaurantOwner = await User.findOne({ email: 'restaurant@zwiggato.com' });
    if (!restaurantOwner) {
      restaurantOwner = await User.create({
        name: 'Restaurant Owner',
        email: 'restaurant@zwiggato.com',
        phone: '9876543210',
        password: 'password123',
        role: 'restaurant'
      });
      console.log('Created restaurant owner user');
    }

    // Create restaurants
    const createdRestaurants = [];
    for (const restaurantData of sampleRestaurants) {
      const restaurant = await Restaurant.create({
        ...restaurantData,
        ownerId: restaurantOwner._id,
        rating: 4.0 + Math.random() * 1.0, // Random rating between 4.0 and 5.0
        totalReviews: Math.floor(Math.random() * 100) + 10
      });
      createdRestaurants.push(restaurant);
      console.log(`Created restaurant: ${restaurant.name}`);

      // Create menu items for this restaurant
      const menuItems = sampleMenuItems[restaurant.name] || [];
      for (const itemData of menuItems) {
        await MenuItem.create({
          ...itemData,
          restaurantId: restaurant._id,
          rating: 4.0 + Math.random() * 1.0,
          totalReviews: Math.floor(Math.random() * 50) + 5
        });
      }
      console.log(`Created ${menuItems.length} menu items for ${restaurant.name}`);
    }

    console.log(`\n✅ Seeding completed successfully!`);
    console.log(`Created ${createdRestaurants.length} restaurants`);
    console.log(`Created menu items for all restaurants`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();

