const express = require('express');
const router = express.Router();
const { getAuditLogs, getEntityAudit } = require('../controllers/auditController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/', authorize('administrator', 'team_lead'), getAuditLogs);
router.get('/:entityId', getEntityAudit);

module.exports = router;
