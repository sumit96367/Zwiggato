const express = require('express');
const { auth } = require('../middleware/auth');
const {
  getRecommendations,
  getTrendingRestaurants
} = require('../controllers/recommendationController');

const router = express.Router();

router.get('/trending', getTrendingRestaurants);
router.get('/', auth, getRecommendations);

module.exports = router;

