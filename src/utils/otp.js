const crypto = require("crypto");

function generateOtp() {
  return ("" + Math.floor(100000 + Math.random() * 900000)); // 6-digit
}

function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

module.exports = { generateOtp, hashOtp };
