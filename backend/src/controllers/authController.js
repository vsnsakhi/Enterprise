const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const createAudit = require('../middleware/audit');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  user.password = undefined;
  res.status(statusCode).json({ success: true, token, data: user });
};

exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role, department } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });
    const user = await User.create({ firstName, lastName, email, password, role, department });
    await createAudit({ entityType: 'User', entityId: user._id.toString(), action: 'CREATE', performedBy: user, req, description: 'User registered', module: 'Auth' });
    sendToken(user, 201, res);
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Provide email and password' });
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (!user.isActive) return res.status(401).json({ success: false, message: 'Account deactivated' });
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    await createAudit({ entityType: 'User', entityId: user._id.toString(), action: 'LOGIN', performedBy: user, req, description: 'User logged in', module: 'Auth' });
    sendToken(user, 200, res);
  } catch (err) { next(err); }
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json({ success: true, data: user });
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, department, preferences } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { firstName, lastName, department, preferences }, { new: true, runValidators: true });
    await createAudit({ entityType: 'User', entityId: user._id.toString(), action: 'UPDATE', performedBy: req.user, req, description: 'Profile updated', module: 'Auth' });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password incorrect' });
    }
    user.password = newPassword;
    await user.save();
    await createAudit({ entityType: 'User', entityId: user._id.toString(), action: 'UPDATE', performedBy: req.user, req, description: 'Password changed', module: 'Auth', severity: 'Warning' });
    sendToken(user, 200, res);
  } catch (err) { next(err); }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, count: users.length, data: users });
  } catch (err) { next(err); }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

exports.logout = async (req, res) => {
  await createAudit({ entityType: 'User', entityId: req.user._id.toString(), action: 'LOGOUT', performedBy: req.user, req, description: 'User logged out', module: 'Auth' });
  res.json({ success: true, message: 'Logged out' });
};
