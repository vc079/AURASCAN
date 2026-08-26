const express = require('express');
const router = express.Router();
const { getDashboardData, renderDashboard } = require('../controllers/dashboard.controller');

// Returns the raw JSON data
router.get('/data', getDashboardData);

// Renders the visual HTML page
router.get('/', renderDashboard);

module.exports = router;