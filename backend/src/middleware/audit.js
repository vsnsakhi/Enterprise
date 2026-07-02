const Audit = require('../models/Audit');

const createAudit = async ({ entityType, entityId, action, performedBy, req, oldValue, newValue, description, module, severity = 'Info' }) => {
  try {
    const changes = [];
    if (oldValue && newValue) {
      Object.keys(newValue).forEach(key => {
        if (JSON.stringify(oldValue[key]) !== JSON.stringify(newValue[key])) {
          changes.push({ field: key, oldVal: oldValue[key], newVal: newValue[key] });
        }
      });
    }
    await Audit.create({
      entityType, entityId, action,
      performedBy: performedBy._id || performedBy,
      performedByName: performedBy.fullName || `${performedBy.firstName} ${performedBy.lastName}`,
      performedByRole: performedBy.role,
      ipAddress: req?.ip || req?.connection?.remoteAddress || 'unknown',
      userAgent: req?.headers?.['user-agent'] || 'unknown',
      oldValue, newValue, changes, description, module, severity
    });
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
};

module.exports = createAudit;
