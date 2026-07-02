const express = require('express');
const router = express.Router();
const { createTrade, getTrades, getTrade, updateTrade, validateTrade, matchTrade, settleTrade, rejectTrade, getTradeStats } = require('../controllers/tradeController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/stats', getTradeStats);
router.route('/').get(getTrades).post(createTrade);
router.route('/:id').get(getTrade).put(updateTrade);
router.post('/:id/validate', validateTrade);
router.post('/:id/match', matchTrade);
router.post('/:id/settle', authorize('team_lead', 'administrator'), settleTrade);
router.post('/:id/reject', authorize('team_lead', 'administrator'), rejectTrade);

module.exports = router;
