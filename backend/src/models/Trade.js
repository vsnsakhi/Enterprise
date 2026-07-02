const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const tradeSchema = new mongoose.Schema({
  tradeId: { type: String, unique: true, default: () => `TRD-${Date.now()}-${uuidv4().slice(0, 6).toUpperCase()}` },
  buyer: { type: String, required: true, trim: true },
  seller: { type: String, required: true, trim: true },
  assetType: { type: String, enum: ['Stock', 'Bond', 'ETF', 'Currency'], required: true },
  assetSymbol: { type: String, required: true, uppercase: true },
  assetName: { type: String, required: true },
  price: { type: Number, required: true, min: 0.01 },
  quantity: { type: Number, required: true, min: 1 },
  totalValue: { type: Number },
  currency: { type: String, required: true, default: 'USD', uppercase: true },
  tradeDate: { type: Date, required: true },
  settlementDate: { type: Date, required: true },
  broker: { type: String, required: true },
  counterparty: { type: String, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Validated', 'Matched', 'Failed', 'Settled', 'Rejected'],
    default: 'Pending'
  },
  validationStatus: { type: String, enum: ['Pending', 'Passed', 'Failed'], default: 'Pending' },
  validationErrors: [{ type: String }],
  matchStatus: { type: String, enum: ['Unmatched', 'Matched', 'Partial', 'Failed'], default: 'Unmatched' },
  matchDetails: {
    frontOffice: { type: mongoose.Schema.Types.Mixed },
    middleOffice: { type: mongoose.Schema.Types.Mixed },
    settlementSystem: { type: mongoose.Schema.Types.Mixed }
  },
  settlementDetails: {
    settledAt: Date,
    settledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    settlementRef: String,
    processingTime: Number
  },
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Low' },
  notes: { type: String },
  tags: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  source: { type: String, enum: ['Manual', 'API', 'Import'], default: 'Manual' }
}, { timestamps: true });

tradeSchema.pre('save', function (next) {
  this.totalValue = this.price * this.quantity;
  next();
});

tradeSchema.index({ tradeId: 1, status: 1, assetType: 1, tradeDate: -1 });

module.exports = mongoose.model('Trade', tradeSchema);
