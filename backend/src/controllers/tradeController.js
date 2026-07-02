const Trade = require('../models/Trade');
const Exception = require('../models/Exception');
const Notification = require('../models/Notification');
const createAudit = require('../middleware/audit');

const createNotification = async (recipient, type, title, message, entityId, priority = 'Medium') => {
  try {
    await Notification.create({ recipient, type, title, message, entityType: 'Trade', entityId, priority });
  } catch (e) { console.error('Notification error:', e.message); }
};

exports.createTrade = async (req, res, next) => {
  try {
    const trade = await Trade.create({ ...req.body, createdBy: req.user._id });
    await createAudit({ entityType: 'Trade', entityId: trade.tradeId, action: 'CREATE', performedBy: req.user, req, newValue: trade.toObject(), description: `Trade ${trade.tradeId} created`, module: 'Trade Capture' });
    res.status(201).json({ success: true, data: trade });
  } catch (err) { next(err); }
};

exports.getTrades = async (req, res, next) => {
  try {
    const { status, assetType, search, dateFrom, dateTo, riskLevel, page = 1, limit = 20, sort = '-createdAt' } = req.query;
    const query = {};
    if (status) query.status = status;
    if (assetType) query.assetType = assetType;
    if (riskLevel) query.riskLevel = riskLevel;
    if (dateFrom || dateTo) {
      query.tradeDate = {};
      if (dateFrom) query.tradeDate.$gte = new Date(dateFrom);
      if (dateTo) query.tradeDate.$lte = new Date(dateTo);
    }
    if (search) {
      query.$or = [
        { tradeId: { $regex: search, $options: 'i' } },
        { buyer: { $regex: search, $options: 'i' } },
        { seller: { $regex: search, $options: 'i' } },
        { assetSymbol: { $regex: search, $options: 'i' } },
        { counterparty: { $regex: search, $options: 'i' } },
        { broker: { $regex: search, $options: 'i' } }
      ];
    }
    const skip = (page - 1) * limit;
    const [trades, total] = await Promise.all([
      Trade.find(query).populate('createdBy', 'firstName lastName').sort(sort).skip(skip).limit(Number(limit)),
      Trade.countDocuments(query)
    ]);
    res.json({ success: true, count: trades.length, total, pages: Math.ceil(total / limit), currentPage: Number(page), data: trades });
  } catch (err) { next(err); }
};

exports.getTrade = async (req, res, next) => {
  try {
    const trade = await Trade.findOne({ $or: [{ _id: req.params.id }, { tradeId: req.params.id }] })
      .populate('createdBy', 'firstName lastName role')
      .populate('updatedBy', 'firstName lastName');
    if (!trade) return res.status(404).json({ success: false, message: 'Trade not found' });
    res.json({ success: true, data: trade });
  } catch (err) { next(err); }
};

exports.updateTrade = async (req, res, next) => {
  try {
    const old = await Trade.findById(req.params.id);
    if (!old) return res.status(404).json({ success: false, message: 'Trade not found' });
    if (['Settled', 'Rejected'].includes(old.status)) {
      return res.status(400).json({ success: false, message: 'Cannot modify settled/rejected trade' });
    }
    const trade = await Trade.findByIdAndUpdate(req.params.id, { ...req.body, updatedBy: req.user._id }, { new: true, runValidators: true });
    await createAudit({ entityType: 'Trade', entityId: trade.tradeId, action: 'UPDATE', performedBy: req.user, req, oldValue: old.toObject(), newValue: trade.toObject(), description: `Trade ${trade.tradeId} updated`, module: 'Trade Capture' });
    res.json({ success: true, data: trade });
  } catch (err) { next(err); }
};

exports.validateTrade = async (req, res, next) => {
  try {
    const trade = await Trade.findById(req.params.id);
    if (!trade) return res.status(404).json({ success: false, message: 'Trade not found' });
    const errors = [];
    if (!trade.buyer || !trade.seller) errors.push('Missing buyer or seller');
    if (trade.price <= 0) errors.push('Invalid price: must be positive');
    if (trade.quantity <= 0) errors.push('Invalid quantity: must be positive');
    if (new Date(trade.tradeDate) > new Date()) errors.push('Trade date cannot be in the future');
    if (new Date(trade.settlementDate) <= new Date(trade.tradeDate)) errors.push('Settlement date must be after trade date');
    if (!trade.counterparty) errors.push('Missing counterparty');
    if (!trade.broker) errors.push('Missing broker');
    if (!['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD'].includes(trade.currency)) errors.push(`Invalid currency: ${trade.currency}`);
    const duplicate = await Trade.findOne({ tradeId: { $ne: trade.tradeId }, buyer: trade.buyer, seller: trade.seller, assetSymbol: trade.assetSymbol, price: trade.price, quantity: trade.quantity, tradeDate: trade.tradeDate });
    if (duplicate) errors.push(`Potential duplicate of trade ${duplicate.tradeId}`);
    const passed = errors.length === 0;
    const update = { validationStatus: passed ? 'Passed' : 'Failed', validationErrors: errors, status: passed ? 'Validated' : 'Failed', updatedBy: req.user._id };
    const updated = await Trade.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!passed) {
      await Exception.create({ trade: trade._id, tradeId: trade.tradeId, type: 'Validation Failed', priority: 'High', title: `Validation failed for ${trade.tradeId}`, description: errors.join('; '), createdBy: req.user._id });
      await createNotification(req.user._id, 'validation_failed', 'Trade Validation Failed', `Trade ${trade.tradeId} failed validation`, trade.tradeId, 'High');
    }
    await createAudit({ entityType: 'Trade', entityId: trade.tradeId, action: 'VALIDATE', performedBy: req.user, req, description: `Validation ${passed ? 'passed' : 'failed'}: ${errors.join(', ')}`, module: 'Validation Engine' });
    res.json({ success: true, passed, errors, data: updated });
  } catch (err) { next(err); }
};

exports.matchTrade = async (req, res, next) => {
  try {
    const trade = await Trade.findById(req.params.id);
    if (!trade) return res.status(404).json({ success: false, message: 'Trade not found' });
    const { frontOffice, middleOffice, settlementSystem } = req.body;
    const mismatches = [];
    if (frontOffice && middleOffice) {
      if (Math.abs(frontOffice.price - middleOffice.price) > 0.01) mismatches.push(`Price mismatch: FO=${frontOffice.price} MO=${middleOffice.price}`);
      if (frontOffice.quantity !== middleOffice.quantity) mismatches.push(`Quantity mismatch: FO=${frontOffice.quantity} MO=${middleOffice.quantity}`);
      if (frontOffice.tradeId !== middleOffice.tradeId) mismatches.push('Trade ID mismatch between FO and MO');
    }
    if (middleOffice && settlementSystem) {
      if (Math.abs(middleOffice.price - settlementSystem.price) > 0.01) mismatches.push(`Price mismatch: MO=${middleOffice.price} SS=${settlementSystem.price}`);
      if (middleOffice.quantity !== settlementSystem.quantity) mismatches.push(`Quantity mismatch: MO=${middleOffice.quantity} SS=${settlementSystem.quantity}`);
    }
    const matched = mismatches.length === 0;
    const update = { matchStatus: matched ? 'Matched' : 'Failed', status: matched ? 'Matched' : 'Failed', matchDetails: { frontOffice, middleOffice, settlementSystem }, updatedBy: req.user._id };
    const updated = await Trade.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!matched) {
      await Exception.create({ trade: trade._id, tradeId: trade.tradeId, type: 'Price Mismatch', priority: 'Critical', title: `Match failed for ${trade.tradeId}`, description: mismatches.join('; '), createdBy: req.user._id });
      await createNotification(req.user._id, 'match_failed', 'Trade Match Failed', `Trade ${trade.tradeId} failed matching`, trade.tradeId, 'Critical');
    }
    await createAudit({ entityType: 'Trade', entityId: trade.tradeId, action: 'MATCH', performedBy: req.user, req, description: `Match ${matched ? 'succeeded' : 'failed'}: ${mismatches.join(', ')}`, module: 'Matching Engine' });
    res.json({ success: true, matched, mismatches, data: updated });
  } catch (err) { next(err); }
};

exports.settleTrade = async (req, res, next) => {
  try {
    const trade = await Trade.findById(req.params.id);
    if (!trade) return res.status(404).json({ success: false, message: 'Trade not found' });
    if (trade.status !== 'Matched') return res.status(400).json({ success: false, message: 'Trade must be Matched before settlement' });
    const processingTime = Math.floor((new Date() - trade.createdAt) / 1000 / 60);
    const update = {
      status: 'Settled',
      settlementDetails: { settledAt: new Date(), settledBy: req.user._id, settlementRef: `SET-${Date.now()}`, processingTime },
      updatedBy: req.user._id
    };
    const updated = await Trade.findByIdAndUpdate(req.params.id, update, { new: true });
    await createNotification(req.user._id, 'trade_settled', 'Trade Settled', `Trade ${trade.tradeId} settled successfully`, trade.tradeId, 'Low');
    await createAudit({ entityType: 'Trade', entityId: trade.tradeId, action: 'SETTLE', performedBy: req.user, req, description: `Trade ${trade.tradeId} settled`, module: 'Settlement Engine' });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};

exports.rejectTrade = async (req, res, next) => {
  try {
    const trade = await Trade.findByIdAndUpdate(req.params.id, { status: 'Rejected', notes: req.body.reason, updatedBy: req.user._id }, { new: true });
    if (!trade) return res.status(404).json({ success: false, message: 'Trade not found' });
    await createNotification(req.user._id, 'trade_failed', 'Trade Rejected', `Trade ${trade.tradeId} was rejected`, trade.tradeId, 'High');
    await createAudit({ entityType: 'Trade', entityId: trade.tradeId, action: 'REJECT', performedBy: req.user, req, description: `Trade rejected: ${req.body.reason}`, module: 'Settlement Engine', severity: 'Warning' });
    res.json({ success: true, data: trade });
  } catch (err) { next(err); }
};

exports.getTradeStats = async (req, res, next) => {
  try {
    const [statusStats, assetStats, dailyVolume, recentTrades] = await Promise.all([
      Trade.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, totalValue: { $sum: '$totalValue' } } }]),
      Trade.aggregate([{ $group: { _id: '$assetType', count: { $sum: 1 } } }]),
      Trade.aggregate([
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 }, value: { $sum: '$totalValue' } } },
        { $sort: { _id: -1 } }, { $limit: 30 }
      ]),
      Trade.find().sort('-createdAt').limit(5).populate('createdBy', 'firstName lastName')
    ]);
    const total = await Trade.countDocuments();
    const settled = statusStats.find(s => s._id === 'Settled')?.count || 0;
    const failed = statusStats.find(s => s._id === 'Failed')?.count || 0;
    const pending = statusStats.find(s => s._id === 'Pending')?.count || 0;
    const exceptions = await require('../models/Exception').countDocuments({ status: { $ne: 'Closed' } });
    res.json({
      success: true, data: {
        kpis: { total, settled, failed, pending, exceptions, settlementRate: total ? ((settled / total) * 100).toFixed(1) : 0, matchRate: total ? (((total - failed) / total) * 100).toFixed(1) : 0 },
        statusStats, assetStats, dailyVolume: dailyVolume.reverse(), recentTrades
      }
    });
  } catch (err) { next(err); }
};
