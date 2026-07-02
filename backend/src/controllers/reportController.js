const Trade = require('../models/Trade');
const Exception = require('../models/Exception');
const Report = require('../models/Report');
const createAudit = require('../middleware/audit');

exports.generateReport = async (req, res, next) => {
  try {
    const { type, period, dateFrom, dateTo, name } = req.body;
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    const tradeQuery = { createdAt: { $gte: from, $lte: to } };
    const [trades, exceptions] = await Promise.all([
      Trade.find(tradeQuery),
      Exception.find({ createdAt: { $gte: from, $lte: to } })
    ]);
    const settled = trades.filter(t => t.status === 'Settled');
    const failed = trades.filter(t => t.status === 'Failed' || t.status === 'Rejected');
    const summary = {
      totalTrades: trades.length,
      settledTrades: settled.length,
      failedTrades: failed.length,
      exceptions: exceptions.length,
      settlementRate: trades.length ? ((settled.length / trades.length) * 100).toFixed(1) : 0,
      totalValue: trades.reduce((sum, t) => sum + (t.totalValue || 0), 0)
    };
    const report = await Report.create({ name: name || `${type} Report - ${period}`, type, period, dateFrom: from, dateTo: to, status: 'Ready', summary, data: { trades: trades.map(t => ({ tradeId: t.tradeId, status: t.status, assetType: t.assetType, totalValue: t.totalValue, tradeDate: t.tradeDate })), exceptions: exceptions.map(e => ({ exceptionId: e.exceptionId, type: e.type, priority: e.priority, status: e.status })) }, generatedBy: req.user._id });
    await createAudit({ entityType: 'Report', entityId: report.reportId, action: 'CREATE', performedBy: req.user, req, description: `Report generated: ${report.name}`, module: 'Reporting' });
    res.status(201).json({ success: true, data: report });
  } catch (err) { next(err); }
};

exports.getReports = async (req, res, next) => {
  try {
    const reports = await Report.find().populate('generatedBy', 'firstName lastName').sort('-createdAt').limit(50);
    res.json({ success: true, count: reports.length, data: reports });
  } catch (err) { next(err); }
};

exports.getReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id).populate('generatedBy', 'firstName lastName');
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.json({ success: true, data: report });
  } catch (err) { next(err); }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [volumeTrend, settlementPerf, assetBreakdown, exceptionTrend, processingTimes] = await Promise.all([
      Trade.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 }, value: { $sum: '$totalValue' } } },
        { $sort: { _id: 1 } }
      ]),
      Trade.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 }, avgValue: { $avg: '$totalValue' } } }
      ]),
      Trade.aggregate([
        { $group: { _id: '$assetType', count: { $sum: 1 }, totalValue: { $sum: '$totalValue' } } }
      ]),
      Exception.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      Trade.aggregate([
        { $match: { status: 'Settled', 'settlementDetails.processingTime': { $exists: true } } },
        { $group: { _id: '$assetType', avgProcessingTime: { $avg: '$settlementDetails.processingTime' } } }
      ])
    ]);
    res.json({ success: true, data: { volumeTrend, settlementPerf, assetBreakdown, exceptionTrend, processingTimes } });
  } catch (err) { next(err); }
};
