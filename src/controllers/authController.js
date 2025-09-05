const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { generateOtp, hashOtp } = require("../utils/otp");

exports.sendOtp = async (req, res) => {
  try {
    const { aadhaar, mobile } = req.body;

    if (!/^\d{12}$/.test(aadhaar)) {
      return res.status(400).json({ error: "Invalid Aadhaar number" });
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

    await prisma.otpVerification.upsert({
      where: { aadhaar_mobile: { aadhaar, mobile } },
      update: { otpHash, expiresAt, verified: false },
      create: { aadhaar, mobile, otpHash, expiresAt },
    });

    console.log(`📲 OTP for ${mobile}: ${otp}`);
    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to send OTP", details: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { aadhaar, mobile, otp } = req.body;
    const otpHash = hashOtp(otp);

    const record = await prisma.otpVerification.findUnique({
      where: { aadhaar_mobile: { aadhaar, mobile } },
    });

    if (!record || record.otpHash !== otpHash || record.expiresAt < new Date()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    await prisma.otpVerification.update({
      where: { aadhaar_mobile: { aadhaar, mobile } },
      data: { verified: true },
    });

    res.json({ message: "OTP verified. Proceed to registration." });
  } catch (err) {
    res.status(500).json({ error: "OTP verification failed", details: err.message });
  }
};
