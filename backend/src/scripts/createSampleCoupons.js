const mongoose = require('mongoose');
require('dotenv').config();

const Coupon = require('../models/Coupon');

const sampleCoupons = [
  {
    code: 'WELCOME10',
    description: '10% off on your first order',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 200,
    maxDiscount: 100,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    usageLimit: null,
    applicableTo: 'all'
  },
  {
    code: 'SAVE50',
    description: 'Flat ₹50 off on orders above ₹300',
    discountType: 'fixed',
    discountValue: 50,
    minOrderAmount: 300,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months
    usageLimit: 1000,
    applicableTo: 'all'
  },
  {
    code: 'WEEKEND20',
    description: '20% off on weekends',
    discountType: 'percentage',
    discountValue: 20,
    minOrderAmount: 500,
    maxDiscount: 200,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
    usageLimit: null,
    applicableTo: 'all'
  },
  {
    code: 'FIRST100',
    description: '₹100 off on orders above ₹500',
    discountType: 'fixed',
    discountValue: 100,
    minOrderAmount: 500,
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 2 months
    usageLimit: 500,
    applicableTo: 'all'
  }
];

async function createSampleCoupons() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zwiggato');
    console.log('✅ Connected to MongoDB');

    // Clear existing coupons
    await Coupon.deleteMany({});
    console.log('🗑️  Cleared existing coupons');

    // Create sample coupons
    const createdCoupons = await Coupon.insertMany(sampleCoupons);
    console.log(`✅ Created ${createdCoupons.length} sample coupons`);

    console.log('\n📋 Available Coupons:');
    createdCoupons.forEach(coupon => {
      console.log(`  - ${coupon.code}: ${coupon.description}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating coupons:', error);
    process.exit(1);
  }
}

createSampleCoupons();

