// src/controllers/touristController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
  generateDek,
  encryptWithDek,
  wrapDek,
  hashValue,
  encryptMobile,
} = require("../utils/encryption");
const { generateOtp } = require("../utils/otp");
const crypto = require("crypto");

// In-memory OTP store (replace with DB/Redis in production)
const otpStore = {}; 
// { mobile: { otp, expiresAt, type, aadhaar?, visaId? } }

// ===============================
// 1. Send OTP
// ===============================
exports.sendOtp = async (req, res) => {
  try {
    const { mobile, type, aadhaar, visaId } = req.body;
    if (!mobile || !type) {
      return res.status(400).json({ error: "Mobile and type are required" });
    }
    if (type === "INDIAN" && !/^\d{12}$/.test(aadhaar || "")) {
      return res.status(400).json({ error: "Invalid or missing Aadhaar (12 digits)" });
    }
    if (type === "FOREIGNER" && !visaId) {
      return res.status(400).json({ error: "Visa ID is required for foreigner" });
    }

    const otp = generateOtp();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    otpStore[mobile] = { otp, expiresAt, type, aadhaar, visaId };

    console.log(`📲 OTP for ${mobile}: ${otp}`);
    res.json({ message: "OTP sent successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to send OTP", details: err.message });
  }
};

// ===============================
// 2. Verify OTP + Register Tourist
// ===============================
exports.verifyOtpAndRegister = async (req, res) => {
  try {
    const {
      mobile,
      otp,
      type,        // "INDIAN" | "FOREIGNER"
      aadhaar,     // for INDIAN
      visaId,      // for FOREIGNER
      name,
      age,
      gender,
      address,
      emergencyContact,
      travelStart,
      travelEnd,
      consent,
    } = req.body;

    // 1. Validate OTP
    const record = otpStore[mobile];
    if (!record || record.otp !== otp || record.expiresAt < Date.now()) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }
    if (record.type !== type) {
      return res.status(400).json({ error: "Type does not match OTP session" });
    }
    if (type === "INDIAN" && record.aadhaar !== aadhaar) {
      return res.status(400).json({ error: "Aadhaar does not match OTP session" });
    }
    if (type === "FOREIGNER" && record.visaId !== visaId) {
      return res.status(400).json({ error: "Visa ID does not match OTP session" });
    }
    delete otpStore[mobile]; // OTP one-time use

    // 2. Hash Aadhaar/Visa
    let aadhaarHash = null;
    let visaIdHash = null;
    if (type === "INDIAN") {
      aadhaarHash = hashValue(aadhaar);
    } else if (type === "FOREIGNER") {
      visaIdHash = hashValue(visaId);
    }

    // 3. Business Rules: Prevent duplicates
    if (aadhaarHash) {
      const existingByAadhaar = await prisma.tourist.findFirst({
        where: { aadhaarHash },
      });
      if (existingByAadhaar) {
        return res.status(400).json({ error: "This Aadhaar is already registered" });
      }
    }
    if (visaIdHash) {
      const existingByVisa = await prisma.tourist.findFirst({
        where: { visaIdHash },
      });
      if (existingByVisa) {
        return res.status(400).json({ error: "This Visa ID is already registered" });
      }
    }

    // 4. Encrypt mobile separately
    const { encryptedMobile, mobileNonce, mobileTag } = encryptMobile(mobile);

    // Check duplicate mobile for overlapping trip
    const overlappingMobile = await prisma.tourist.findFirst({
      where: {
        mobile: encryptedMobile,
        // Overlapping trip check
        AND: [
          {
            travelStart: { lte: new Date(travelEnd) },
            travelEnd: { gte: new Date(travelStart) },
          },
        ],
      },
    });
    if (overlappingMobile) {
      return res.status(400).json({ error: "This mobile number is already registered for an overlapping trip" });
    }

    // 5. Build payload to encrypt
    const payload = {
      name,
      age,
      gender,
      address,
      emergencyContact,
      travelStart,
      travelEnd,
      consent,
      mobile,
    };

    // 6. Generate DEK + Encrypt payload
    const dek = generateDek();
    const { encrypted, nonce, tag } = encryptWithDek(payload, dek);
    const { wrappedDek, wrappedDekNonce, wrappedDekTag } = wrapDek(dek);

    // 7. Generate public touristId
    const touristId = crypto.randomBytes(6).toString("hex");

    // 8. Persist in DB
    await prisma.tourist.create({
      data: {
        touristId,
        type,
        aadhaarHash,
        visaIdHash,
        mobile: encryptedMobile,
        mobileNonce,
        mobileTag,
        encryptedPayload: encrypted,
        payloadNonce: nonce,
        payloadTag: tag,
        wrappedDek,
        wrappedDekNonce,
        wrappedDekTag,
        name,
        age,
        gender,
        address,
        emergencyContact,
        travelStart: new Date(travelStart),
        travelEnd: new Date(travelEnd),
        consent,
      },
    });

    res.status(201).json({
      message: "Tourist registered successfully",
      touristId,
    });
  } catch (err) {
    res.status(500).json({ error: "Registration failed", details: err.message });
  }
};
