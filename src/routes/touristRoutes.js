const express = require("express");
const router = express.Router();
const { sendOtp, verifyOtpAndRegister } = require("../controllers/touristcontroller");

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtpAndRegister);

module.exports = router;
