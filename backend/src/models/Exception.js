const mongoose = require('mongoose');

const exceptionSchema = new mongoose.Schema({
  exceptionId: { type: String, unique: true },
  trade: { type: mongoose.Schema.Types.ObjectId, ref: 'Trade', required: true },
  tradeId: { type: String, required: true },
  type: {
    type: String,
    enum: ['Price Mismatch', 'Quantity Mismatch', 'Missing Trade', 'Duplicate Trade',
      'Validation Failed', 'Settlement Failed', 'Counterparty Error', 'System Error', 'Other'],
    required: true
  },
  priority: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'], required: true },
  status: { type: String, enum: ['Open', 'In Progress', 'Escalated', 'Resolved', 'Closed'], default: 'Open' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolutionNotes: { type: String },
  resolvedAt: { type: Date },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  escalatedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  escalatedAt: { type: Date },
  escalationReason: { type: String },
  dueDate: { type: Date },
  slaBreached: { type: Boolean, default: false },
  history: [{
    action: String,
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    notes: String,
    oldStatus: String,
    newStatus: String
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

exceptionSchema.pre('save', function (next) {
  if (!this.exceptionId) {
    this.exceptionId = `EXC-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model('Exception', exceptionSchema);
