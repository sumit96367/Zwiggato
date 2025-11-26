const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
require('dotenv').config();

const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');

// Map Zomato cuisine types to our schema
const cuisineMapping = {
  // Indian
  'North Indian': 'Indian',
  'South Indian': 'Indian',
  'Indian': 'Indian',
  // Chinese
  'Chinese': 'Chinese',
  // Italian
  'Italian': 'Italian',
  'Pizza': 'Pizza',
  'Pasta': 'Pasta',
  // Fast Food
  'Fast Food': 'Fast Food',
  'Burger': 'Burger',
  // Desserts & Beverages
  'Bakery': 'Bakery',
  'Desserts': 'Desserts',
  'Beverages': 'Beverages',
  'Ice Cream': 'Ice Cream',
  'Juices': 'Juices',
  // Asian
  'Thai': 'Thai',
  'Japanese': 'Japanese',
  'Korean': 'Korean',
  'Sushi': 'Sushi',
  'Asian': 'Asian',
  'Filipino': 'Filipino',
  // European
  'Continental': 'Continental',
  'French': 'French',
  'European': 'European',
  'Mediterranean': 'Mediterranean',
  // American
  'American': 'American',
  'Steakhouse': 'Steakhouse',
  'BBQ': 'BBQ',
  'Grill': 'Grill',
  // Latin American
  'Mexican': 'Mexican',
  'Brazilian': 'Brazilian',
  'Peruvian': 'Peruvian',
  'Latin American': 'Latin American',
  // Middle Eastern
  'Arabian': 'Arabian',
  'Lebanese': 'Lebanese',
  // Other
  'Seafood': 'Seafood',
  'Cafe': 'Cafe',
  'Bar Food': 'Bar Food',
  'International': 'International',
  'Healthy Food': 'Healthy Food',
  'Vegetarian': 'Vegetarian',
  'Vegan': 'Vegan'
};

// Default operating hours
const defaultOperatingHours = [
  { day: 'Monday', openTime: '11:00', closeTime: '23:00', isOpen: true },
  { day: 'Tuesday', openTime: '11:00', closeTime: '23:00', isOpen: true },
  { day: 'Wednesday', openTime: '11:00', closeTime: '23:00', isOpen: true },
  { day: 'Thursday', openTime: '11:00', closeTime: '23:00', isOpen: true },
  { day: 'Friday', openTime: '11:00', closeTime: '23:00', isOpen: true },
  { day: 'Saturday', openTime: '11:00', closeTime: '23:00', isOpen: true },
  { day: 'Sunday', openTime: '12:00', closeTime: '22:00', isOpen: true }
];

function parseCuisines(cuisineString) {
  if (!cuisineString) return ['Other'];
  
  const cuisines = cuisineString.split(',').map(c => c.trim());
  const mappedCuisines = cuisines.map(c => {
    // Map to our schema or use 'Other' if not found
    return cuisineMapping[c] || 'Other';
  }).filter((v, i, a) => a.indexOf(v) === i); // Remove duplicates
  
  // If all mapped to 'Other', return at least one cuisine
  if (mappedCuisines.length === 0 || (mappedCuisines.length === 1 && mappedCuisines[0] === 'Other')) {
    return ['Other'];
  }
  
  // Remove 'Other' if we have other cuisines
  return mappedCuisines.filter(c => c !== 'Other').length > 0 
    ? mappedCuisines.filter(c => c !== 'Other')
    : ['Other'];
}

function parseLocation(locationString) {
  if (!locationString) {
    return {
      address: 'Address not available',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      coordinates: { latitude: 19.0760, longitude: 72.8777 }
    };
  }
  
  // Try to extract city from location string
  const parts = locationString.split(',');
  const city = parts[parts.length - 1]?.trim() || 'Mumbai';
  
  return {
    address: locationString,
    city: city,
    state: 'Maharashtra',
    zipCode: '400001',
    coordinates: { latitude: 19.0760, longitude: 72.8777 }
  };
}

function calculateDeliveryTime(approxCost) {
  // Estimate delivery time based on restaurant type
  if (approxCost < 300) return 20; // Fast food
  if (approxCost < 600) return 30; // Casual dining
  return 40; // Fine dining
}

// Generate placeholder image URL based on cuisine type
function getRestaurantImage(cuisineTypes) {
  const cuisine = cuisineTypes[0] || 'food';
  const imageMap = {
    'Indian': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&h=600&fit=crop',
    'Chinese': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=600&fit=crop',
    'Italian': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=600&fit=crop',
    'Mexican': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop',
    'Thai': 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&h=600&fit=crop',
    'Japanese': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&h=600&fit=crop',
    'American': 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&h=600&fit=crop',
    'Fast Food': 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=600&fit=crop',
    'Pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop',
    'Burger': 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&h=600&fit=crop',
    'Seafood': 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&h=600&fit=crop',
    'Desserts': 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&h=600&fit=crop',
    'Cafe': 'https://images.unsplash.com/photo-1501339847302-ac426a4c7c98?w=800&h=600&fit=crop',
    'Korean': 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800&h=600&fit=crop',
    'French': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop',
    'Brazilian': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
    'Mediterranean': 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop',
    'Asian': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop',
    'European': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop',
    'International': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop'
  };
  
  return imageMap[cuisine] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop';
}

// Generate menu item image URL
function getMenuItemImage(itemName, category) {
  const baseUrl = 'https://images.unsplash.com/photo-';
  const imageMap = {
    'Pizza': '1513104890138-7c749659a591',
    'Burger': '1550547660-d9450f859349',
    'Pasta': '1621998906-5baf63c6f9f7',
    'Sushi': '1579584425555-c3ce17fd4351',
    'Chicken': '1606755966158-850c4bc4a57b',
    'Salad': '1546069901-ba9599a7e63c',
    'Dessert': '1551024506-0bccd828d307',
    'Beverage': '1523362628745-0c63b3c5e5b5',
    'Bread': '1509444044470-ef0e4c5a0a5e'
  };
  
  // Try to match by category or item name
  const key = Object.keys(imageMap).find(k => 
    itemName.toLowerCase().includes(k.toLowerCase()) || 
    category.toLowerCase().includes(k.toLowerCase())
  );
  
  if (key) {
    return `${baseUrl}${imageMap[key]}?w=400&h=400&fit=crop`;
  }
  
  // Default food image
  return `${baseUrl}1546069901-ba9599a7e63c?w=400&h=400&fit=crop`;
}

async function importFromCSV(filePath) {
  return new Promise((resolve, reject) => {
    const restaurants = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          const cuisineTypes = parseCuisines(row.cuisines || row.Cuisines || '');
          const restaurant = {
            name: row.name || row['Restaurant Name'] || 'Unknown Restaurant',
            description: row['About'] || row.about || `${row.cuisines || 'Delicious food'} restaurant`,
            cuisineType: cuisineTypes,
            coverImage: getRestaurantImage(cuisineTypes),
            deliveryTime: calculateDeliveryTime(parseFloat(row['Average Cost for two'] || row['approx_cost(for two people)'] || 500)),
            minimumOrder: Math.floor((parseFloat(row['Average Cost for two'] || row['approx_cost(for two people)'] || 500)) / 2),
            rating: parseFloat(row['Aggregate rating'] || row.rate || 0) || 0,
            totalReviews: parseInt(row['Votes'] || row.votes || 0) || 0,
            location: parseLocation(row['Location'] || row.location || row.address || ''),
            operatingHours: defaultOperatingHours,
            isActive: true // Always set to true for imported restaurants
          };
          
          restaurants.push(restaurant);
        } catch (error) {
          console.error('Error parsing row:', error);
        }
      })
      .on('end', () => {
        resolve(restaurants);
      })
      .on('error', reject);
  });
}

async function importFromJSON(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  const jsonData = JSON.parse(data);
  
  // Handle different JSON structures
  const restaurants = Array.isArray(jsonData) ? jsonData : jsonData.restaurants || [];
  
  return restaurants.map(item => {
    const restaurant = item.restaurant || item;
    const cuisineTypes = parseCuisines(restaurant.cuisines || '');
    return {
      name: restaurant.name || 'Unknown Restaurant',
      description: restaurant.cuisines || `${restaurant.cuisines || 'Delicious food'} restaurant`,
      cuisineType: cuisineTypes,
      coverImage: getRestaurantImage(cuisineTypes),
      deliveryTime: calculateDeliveryTime(parseFloat(restaurant['average_cost_for_two'] || restaurant['Average Cost for two'] || 500)),
      minimumOrder: Math.floor((parseFloat(restaurant['average_cost_for_two'] || restaurant['Average Cost for two'] || 500)) / 2),
      rating: parseFloat(restaurant['user_rating']?.aggregate_rating || restaurant['Aggregate rating'] || 0) || 0,
      totalReviews: parseInt(restaurant['user_rating']?.votes || restaurant['Votes'] || 0) || 0,
      location: parseLocation(restaurant.location?.address || restaurant['Location'] || ''),
      operatingHours: defaultOperatingHours,
      isActive: true // Always set to true for imported restaurants
    };
  });
}

async function createSampleMenuItems(restaurantId, cuisineTypes) {
  const menuTemplates = {
    'Indian': [
      { name: 'Butter Chicken', price: 349, category: 'Main Course', dietaryTags: ['Non-Vegetarian'] },
      { name: 'Paneer Tikka', price: 279, category: 'Appetizer', dietaryTags: ['Vegetarian'] },
      { name: 'Dal Makhani', price: 199, category: 'Main Course', dietaryTags: ['Vegetarian'] },
      { name: 'Naan', price: 49, category: 'Bread', dietaryTags: ['Vegetarian'] },
      { name: 'Biryani', price: 299, category: 'Main Course', dietaryTags: ['Non-Vegetarian'] }
    ],
    'Chinese': [
      { name: 'Chicken Fried Rice', price: 249, category: 'Main Course', dietaryTags: ['Non-Vegetarian'] },
      { name: 'Veg Spring Rolls', price: 149, category: 'Appetizer', dietaryTags: ['Vegetarian'] },
      { name: 'Sweet and Sour Chicken', price: 329, category: 'Main Course', dietaryTags: ['Non-Vegetarian'] },
      { name: 'Manchurian', price: 199, category: 'Main Course', dietaryTags: ['Vegetarian'] },
      { name: 'Hakka Noodles', price: 179, category: 'Main Course', dietaryTags: ['Vegetarian'] }
    ],
    'Italian': [
      { name: 'Margherita Pizza', price: 299, category: 'Main Course', dietaryTags: ['Vegetarian'] },
      { name: 'Pepperoni Pizza', price: 399, category: 'Main Course', dietaryTags: ['Non-Vegetarian'] },
      { name: 'Pasta Carbonara', price: 349, category: 'Main Course', dietaryTags: ['Non-Vegetarian'] },
      { name: 'Garlic Bread', price: 149, category: 'Bread', dietaryTags: ['Vegetarian'] },
      { name: 'Caesar Salad', price: 199, category: 'Salad', dietaryTags: ['Vegetarian'] }
    ],
    'Fast Food': [
      { name: 'Classic Burger', price: 199, category: 'Main Course', dietaryTags: ['Non-Vegetarian'] },
      { name: 'Veg Burger', price: 149, category: 'Main Course', dietaryTags: ['Vegetarian'] },
      { name: 'French Fries', price: 99, category: 'Appetizer', dietaryTags: ['Vegetarian'] },
      { name: 'Chicken Wings', price: 249, category: 'Appetizer', dietaryTags: ['Non-Vegetarian'] },
      { name: 'Onion Rings', price: 119, category: 'Appetizer', dietaryTags: ['Vegetarian'] }
    ],
    'Desserts': [
      { name: 'Chocolate Cake', price: 249, category: 'Dessert', dietaryTags: ['Vegetarian'] },
      { name: 'Ice Cream Sundae', price: 149, category: 'Dessert', dietaryTags: ['Vegetarian'] },
      { name: 'Cheesecake', price: 279, category: 'Dessert', dietaryTags: ['Vegetarian'] },
      { name: 'Brownie', price: 129, category: 'Dessert', dietaryTags: ['Vegetarian'] },
      { name: 'Milkshake', price: 149, category: 'Beverage', dietaryTags: ['Vegetarian'] }
    ]
  };
  
  const menuItems = [];
  const primaryCuisine = cuisineTypes[0] || 'Indian';
  const template = menuTemplates[primaryCuisine] || menuTemplates['Indian'];
  
  for (const item of template) {
    menuItems.push({
      ...item,
      restaurantId: restaurantId,
      description: `Delicious ${item.name.toLowerCase()}`,
      image: getMenuItemImage(item.name, item.category),
      isAvailable: true,
      preparationTime: 15
    });
  }
  
  return menuItems;
}

async function seedZomatoData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zwiggato');
    console.log('✅ Connected to MongoDB');

    // Get or create restaurant owner
    let restaurantOwner = await User.findOne({ email: 'restaurant@zwiggato.com' });
    if (!restaurantOwner) {
      restaurantOwner = await User.create({
        name: 'Restaurant Owner',
        email: 'restaurant@zwiggato.com',
        phone: '9876543210',
        password: 'password123',
        role: 'restaurant'
      });
      console.log('✅ Created restaurant owner user');
    }

    // Check for data file
    const dataDir = path.join(__dirname, '../../data');
    const csvFile = path.join(dataDir, 'zomato.csv');
    const jsonFile = path.join(dataDir, 'zomato.json');
    
    let restaurants = [];
    
    if (fs.existsSync(csvFile)) {
      console.log('📄 Found CSV file, importing...');
      restaurants = await importFromCSV(csvFile);
    } else if (fs.existsSync(jsonFile)) {
      console.log('📄 Found JSON file, importing...');
      restaurants = await importFromJSON(jsonFile);
    } else {
      console.error('❌ No data file found!');
      console.log('Please download the Zomato dataset and place it in:');
      console.log(`  - ${csvFile}`);
      console.log(`  - or ${jsonFile}`);
      console.log('\nTo download from Kaggle:');
      console.log('1. Install Kaggle API: pip install kaggle');
      console.log('2. Set up credentials: ~/.kaggle/kaggle.json');
      console.log('3. Download: kaggle datasets download -d snapshots/zomato-restaurants-data');
      process.exit(1);
    }

    if (restaurants.length === 0) {
      console.error('❌ No restaurants found in data file');
      process.exit(1);
    }

    console.log(`📊 Found ${restaurants.length} restaurants in dataset`);

    // Clear existing data
    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Limit to first 200 restaurants for better data coverage
    const restaurantsToImport = restaurants.slice(0, 200);
    console.log(`📦 Importing ${restaurantsToImport.length} restaurants...`);

    let imported = 0;
    let skipped = 0;

    for (const restaurantData of restaurantsToImport) {
      try {
        // Skip if missing essential data
        if (!restaurantData.name || restaurantData.name === 'Unknown Restaurant') {
          skipped++;
          continue;
        }

        const restaurant = await Restaurant.create({
          ...restaurantData,
          ownerId: restaurantOwner._id
        });

        // Create sample menu items
        const menuItems = await createSampleMenuItems(restaurant._id, restaurantData.cuisineType);
        await MenuItem.insertMany(menuItems);

        imported++;
        if (imported % 10 === 0) {
          console.log(`  ✓ Imported ${imported} restaurants...`);
        }
      } catch (error) {
        console.error(`  ✗ Error importing ${restaurantData.name}:`, error.message);
        skipped++;
      }
    }

    console.log(`\n✅ Import completed!`);
    console.log(`   Imported: ${imported} restaurants`);
    console.log(`   Skipped: ${skipped} restaurants`);
    console.log(`   Total menu items: ${imported * 5}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error importing data:', error);
    process.exit(1);
  }
}

seedZomatoData();

