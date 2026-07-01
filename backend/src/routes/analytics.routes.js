const express = require('express');
const { getDashboardStats } = require('../controllers/analytics.controller.js');
const requireAuth = require('../middleware/requireAuth.js');

const router = express.Router();

// Apply security middleware
router.use(requireAuth);

router.get('/dashboard', getDashboardStats);

module.exports = router;