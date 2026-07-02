const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  auditId: { type: String, unique: true },
  entityType: { type: String, enum: ['Trade', 'Exception', 'User', 'Report', 'System'], required: true },
  entityId: { type: String, required: true },
  action: {
    type: String,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VALIDATE', 'MATCH',
      'SETTLE', 'REJECT', 'ESCALATE', 'RESOLVE', 'EXPORT', 'VIEW'],
    required: true
  },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  performedByName: { type: String },
  performedByRole: { type: String },
  ipAddress: { type: String },
  userAgent: { type: String },
  oldValue: { type: mongoose.Schema.Types.Mixed },
  newValue: { type: mongoose.Schema.Types.Mixed },
  changes: [{ field: String, oldVal: mongoose.Schema.Types.Mixed, newVal: mongoose.Schema.Types.Mixed }],
  description: { type: String },
  module: { type: String },
  severity: { type: String, enum: ['Info', 'Warning', 'Critical'], default: 'Info' },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: false });

auditSchema.pre('save', function (next) {
  if (!this.auditId) {
    this.auditId = `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  }
  next();
});

auditSchema.index({ entityType: 1, entityId: 1, timestamp: -1 });

module.exports = mongoose.model('Audit', auditSchema);
