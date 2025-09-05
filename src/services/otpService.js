const crypto = require("crypto");

function generateOtp() {
  return ("" + Math.floor(100000 + Math.random() * 900000)); // 6-digit OTP
}

function hashPhone(phone) {
  return crypto.createHash("sha256").update(phone).digest("hex");
}

module.exports = { generateOtp, hashPhone };
