// src/routes/touristRoutes.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/touristController');

// Mock OTP send/verify for emergency contact
router.post('/send-otp', ctrl.sendOtp);
router.post('/verify-otp', ctrl.verifyOtp);

// Registration endpoint
router.post('/register', ctrl.registerTourist);

module.exports = router;
