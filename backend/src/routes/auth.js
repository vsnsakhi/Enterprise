const express = require('express');
const router = express.Router();
const { register, login, getMe, updateProfile, updatePassword, getAllUsers, updateUser, logout } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/password', protect, updatePassword);
router.post('/logout', protect, logout);
router.get('/users', protect, authorize('administrator', 'team_lead'), getAllUsers);
router.put('/users/:id', protect, authorize('administrator'), updateUser);

module.exports = router;
