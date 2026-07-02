const express = require('express');
const router = express.Router();
const { getExceptions, getException, assignException, resolveException, escalateException, closeException, getExceptionStats } = require('../controllers/exceptionController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/stats', getExceptionStats);
router.get('/', getExceptions);
router.get('/:id', getException);
router.put('/:id/assign', assignException);
router.put('/:id/resolve', resolveException);
router.put('/:id/escalate', authorize('team_lead', 'administrator'), escalateException);
router.put('/:id/close', authorize('team_lead', 'administrator'), closeException);

module.exports = router;
