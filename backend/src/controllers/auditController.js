const Audit = require('../models/Audit');

exports.getAuditLogs = async (req, res, next) => {
  try {
    const { entityType, entityId, action, performedBy, dateFrom, dateTo, page = 1, limit = 50 } = req.query;
    const query = {};
    if (entityType) query.entityType = entityType;
    if (entityId) query.entityId = { $regex: entityId, $options: 'i' };
    if (action) query.action = action;
    if (performedBy) query.performedByName = { $regex: performedBy, $options: 'i' };
    if (dateFrom || dateTo) {
      query.timestamp = {};
      if (dateFrom) query.timestamp.$gte = new Date(dateFrom);
      if (dateTo) query.timestamp.$lte = new Date(dateTo);
    }
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      Audit.find(query).populate('performedBy', 'firstName lastName role').sort('-timestamp').skip(skip).limit(Number(limit)),
      Audit.countDocuments(query)
    ]);
    res.json({ success: true, count: logs.length, total, pages: Math.ceil(total / limit), data: logs });
  } catch (err) { next(err); }
};

exports.getEntityAudit = async (req, res, next) => {
  try {
    const logs = await Audit.find({ entityId: req.params.entityId }).populate('performedBy', 'firstName lastName role').sort('-timestamp');
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) { next(err); }
};
