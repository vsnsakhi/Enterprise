const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['trade_settled', 'trade_failed', 'exception_raised', 'escalation_alert',
      'validation_failed', 'match_failed', 'sla_breach', 'system_alert'],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  entityType: { type: String },
  entityId: { type: String },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  link: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
