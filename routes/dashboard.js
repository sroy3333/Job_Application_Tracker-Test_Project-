const express = require('express');
const router = express.Router();
const dashboardControlller = require('../controllers/dashboard');
const authenticate = require('../middleware/auth');
router.get('/', authenticate, dashboardControlller.getDashboardData);

module.exports = router;