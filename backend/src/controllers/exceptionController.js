const Exception = require('../models/Exception');
const Notification = require('../models/Notification');
const createAudit = require('../middleware/audit');

exports.getExceptions = async (req, res, next) => {
  try {
    const { status, priority, type, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (type) query.type = type;
    if (search) query.$or = [{ exceptionId: { $regex: search, $options: 'i' } }, { title: { $regex: search, $options: 'i' } }, { tradeId: { $regex: search, $options: 'i' } }];
    const skip = (page - 1) * limit;
    const [exceptions, total] = await Promise.all([
      Exception.find(query).populate('assignedTo', 'firstName lastName').populate('createdBy', 'firstName lastName').sort('-createdAt').skip(skip).limit(Number(limit)),
      Exception.countDocuments(query)
    ]);
    res.json({ success: true, count: exceptions.length, total, pages: Math.ceil(total / limit), data: exceptions });
  } catch (err) { next(err); }
};

exports.getException = async (req, res, next) => {
  try {
    const exc = await Exception.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName role')
      .populate('createdBy', 'firstName lastName')
      .populate('resolvedBy', 'firstName lastName')
      .populate('escalatedTo', 'firstName lastName')
      .populate('history.performedBy', 'firstName lastName');
    if (!exc) return res.status(404).json({ success: false, message: 'Exception not found' });
    res.json({ success: true, data: exc });
  } catch (err) { next(err); }
};

exports.assignException = async (req, res, next) => {
  try {
    const { assignedTo, notes } = req.body;
    const exc = await Exception.findById(req.params.id);
    if (!exc) return res.status(404).json({ success: false, message: 'Exception not found' });
    exc.assignedTo = assignedTo;
    exc.assignedBy = req.user._id;
    exc.status = 'In Progress';
    exc.history.push({ action: 'Assigned', performedBy: req.user._id, notes, oldStatus: exc.status, newStatus: 'In Progress' });
    await exc.save();
    await Notification.create({ recipient: assignedTo, type: 'exception_raised', title: 'Exception Assigned', message: `Exception ${exc.exceptionId} assigned to you`, entityType: 'Exception', entityId: exc.exceptionId, priority: exc.priority });
    await createAudit({ entityType: 'Exception', entityId: exc.exceptionId, action: 'UPDATE', performedBy: req.user, req, description: `Exception assigned`, module: 'Exception Management' });
    res.json({ success: true, data: exc });
  } catch (err) { next(err); }
};

exports.resolveException = async (req, res, next) => {
  try {
    const { resolutionNotes } = req.body;
    const exc = await Exception.findById(req.params.id);
    if (!exc) return res.status(404).json({ success: false, message: 'Exception not found' });
    const oldStatus = exc.status;
    exc.status = 'Resolved';
    exc.resolutionNotes = resolutionNotes;
    exc.resolvedAt = new Date();
    exc.resolvedBy = req.user._id;
    exc.history.push({ action: 'Resolved', performedBy: req.user._id, notes: resolutionNotes, oldStatus, newStatus: 'Resolved' });
    await exc.save();
    await createAudit({ entityType: 'Exception', entityId: exc.exceptionId, action: 'RESOLVE', performedBy: req.user, req, description: `Exception resolved: ${resolutionNotes}`, module: 'Exception Management' });
    res.json({ success: true, data: exc });
  } catch (err) { next(err); }
};

exports.escalateException = async (req, res, next) => {
  try {
    const { escalatedTo, escalationReason } = req.body;
    const exc = await Exception.findById(req.params.id);
    if (!exc) return res.status(404).json({ success: false, message: 'Exception not found' });
    const oldStatus = exc.status;
    exc.status = 'Escalated';
    exc.escalatedTo = escalatedTo;
    exc.escalatedAt = new Date();
    exc.escalationReason = escalationReason;
    exc.history.push({ action: 'Escalated', performedBy: req.user._id, notes: escalationReason, oldStatus, newStatus: 'Escalated' });
    await exc.save();
    await Notification.create({ recipient: escalatedTo, type: 'escalation_alert', title: 'Exception Escalated', message: `Exception ${exc.exceptionId} escalated to you: ${escalationReason}`, entityType: 'Exception', entityId: exc.exceptionId, priority: 'Critical' });
    await createAudit({ entityType: 'Exception', entityId: exc.exceptionId, action: 'ESCALATE', performedBy: req.user, req, description: `Escalated: ${escalationReason}`, module: 'Exception Management', severity: 'Warning' });
    res.json({ success: true, data: exc });
  } catch (err) { next(err); }
};

exports.closeException = async (req, res, next) => {
  try {
    const exc = await Exception.findById(req.params.id);
    if (!exc) return res.status(404).json({ success: false, message: 'Exception not found' });
    exc.status = 'Closed';
    exc.history.push({ action: 'Closed', performedBy: req.user._id, oldStatus: exc.status, newStatus: 'Closed' });
    await exc.save();
    await createAudit({ entityType: 'Exception', entityId: exc.exceptionId, action: 'UPDATE', performedBy: req.user, req, description: 'Exception closed', module: 'Exception Management' });
    res.json({ success: true, data: exc });
  } catch (err) { next(err); }
};

exports.getExceptionStats = async (req, res, next) => {
  try {
    const [byPriority, byStatus, byType] = await Promise.all([
      Exception.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
      Exception.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Exception.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }])
    ]);
    res.json({ success: true, data: { byPriority, byStatus, byType } });
  } catch (err) { next(err); }
};
