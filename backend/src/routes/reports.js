const express = require('express');
const router = express.Router();
const { generateReport, getReports, getReport, getAnalytics } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/analytics', getAnalytics);
router.route('/').get(getReports).post(generateReport);
router.get('/:id', getReport);

module.exports = router;
