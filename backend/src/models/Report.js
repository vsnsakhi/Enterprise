const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportId: { type: String, unique: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['Settlement', 'Exception', 'Validation', 'Trade', 'Analytics'], required: true },
  period: { type: String, enum: ['Daily', 'Weekly', 'Monthly', 'Custom'], required: true },
  dateFrom: { type: Date, required: true },
  dateTo: { type: Date, required: true },
  status: { type: String, enum: ['Generating', 'Ready', 'Failed'], default: 'Generating' },
  data: { type: mongoose.Schema.Types.Mixed },
  summary: {
    totalTrades: Number,
    settledTrades: Number,
    failedTrades: Number,
    exceptions: Number,
    settlementRate: Number,
    totalValue: Number
  },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  format: { type: String, enum: ['JSON', 'PDF', 'Excel'], default: 'JSON' }
}, { timestamps: true });

reportSchema.pre('save', function (next) {
  if (!this.reportId) {
    this.reportId = `RPT-${Date.now()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model('Report', reportSchema);
