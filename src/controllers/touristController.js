// src/controllers/touristController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
  getKek,
  generateDek,
  encryptPayloadWithDek,
  wrapDekWithKek,
  sha256Hex,
} = require("../utils/crypto");

const redisClientPromise = require("../utils/redis"); // ✅ Import Redis client

/* ----------------------- Helpers ----------------------- */
function hashNormalizedAadhaar(aadhaar) {
  return sha256Hex(aadhaar.trim());
}

function phoneHash(phone) {
  return sha256Hex(phone.trim());
}

/* ------------------ OTP endpoints ------------------ */
exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "phone required" });

    if (!/^\+?\d{7,15}$/.test(phone))
      return res.status(400).json({ error: "invalid phone format" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry
    const pHash = phoneHash(phone);

    // ✅ Save OTP in Redis
    const redisClient = await redisClientPromise;
    await redisClient.setEx(pHash, 300, otp);

    // Optional DB persistence
    try {
      await prisma.oTPVerification.upsert({
        where: { phoneHash: pHash },
        update: { otp, expiresAt },
        create: { phoneHash: pHash, otp, expiresAt },
      });
    } catch (e) {
      console.warn("DB persistence failed:", e.message);
    }

    console.log(`📩 OTP for ${phone}: ${otp} (expires ${expiresAt.toISOString()})`);

    return res.json({
      success: true,
      message: "OTP sent (mock). Check server console.",
    });
  } catch (err) {
    console.error("sendOtp ERR:", err);
    return res.status(500).json({ error: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ error: "phone and otp required" });
    }

    const pHash = phoneHash(phone);
    const redisClient = await redisClientPromise;
    const storedOtp = await redisClient.get(pHash);

    if (!storedOtp) {
      return res.status(400).json({ error: "otp not requested or expired" });
    }

    if (storedOtp !== otp) {
      return res.status(400).json({ error: "invalid otp" });
    }

    // ✅ OTP is correct → delete from Redis
    await redisClient.del(pHash);

    return res.json({ success: true, message: "OTP verified" });
  } catch (err) {
    console.error("verifyOtp ERR:", err);
    return res.status(500).json({ error: err.message });
  }
};

/* ------------------ Registration endpoint ------------------ */
exports.registerTourist = async (req, res) => {
  try {
    const payload = req.body;

    // Step 1: Basic validations
    if (!payload.type || !["INDIAN", "FOREIGN"].includes(payload.type))
      return res.status(400).json({ error: "type must be INDIAN or FOREIGN" });

    if (!payload.name || payload.name.trim().length < 2)
      return res.status(400).json({ error: "name required" });

    if (!payload.consent) return res.status(400).json({ error: "consent required" });
    if (!payload.travelFrom || !payload.travelTo)
      return res.status(400).json({ error: "travelFrom and travelTo required" });

    const travelFrom = new Date(payload.travelFrom);
    const travelTo = new Date(payload.travelTo);
    if (isNaN(travelFrom) || isNaN(travelTo) || travelFrom > travelTo)
      return res.status(400).json({ error: "invalid travel dates" });

    // Step 2: Aadhaar / Passport validation + duplicate prevention
    let uniqueHash = null;

    if (payload.type === "INDIAN") {
      const aadhaar = (payload.aadhaar || "").trim();
      if (!/^\d{12}$/.test(aadhaar))
        return res.status(400).json({ error: "aadhaar must be 12 digits" });

      uniqueHash = hashNormalizedAadhaar(aadhaar);

      const duplicate = await prisma.tourist.findFirst({
        where: {
          aadhaarHash: uniqueHash,
          AND: [
            { travelFrom: { lte: travelTo } },
            { travelTo: { gte: travelFrom } },
          ],
        },
      });
      if (duplicate)
        return res.status(409).json({
          error: "Tourist with same Aadhaar already registered for overlapping dates",
        });
    } else {
      const passport = (payload.passport || "").trim();
      if (!/^[A-Z0-9\-]{5,20}$/i.test(passport))
        return res.status(400).json({ error: "invalid passport number format" });

      uniqueHash = sha256Hex(passport);
      const duplicate = await prisma.tourist.findFirst({
        where: {
          aadhaarHash: uniqueHash,
          AND: [
            { travelFrom: { lte: travelTo } },
            { travelTo: { gte: travelFrom } },
          ],
        },
      });
      if (duplicate)
        return res.status(409).json({
          error: "Tourist with same passport already registered for overlapping dates",
        });
    }

    // Step 3: OTP verification for mobile
    if (payload.mobile) {
      if (!payload.otp)
        return res.status(400).json({ error: "OTP required for mobile verification" });

      const pHash = phoneHash(payload.mobile);
      const redisClient = await redisClientPromise;
      const storedOtp = await redisClient.get(pHash);

      if (!storedOtp || storedOtp !== payload.otp) {
        return res.status(400).json({ error: "Invalid or expired OTP for mobile" });
      }

      // ✅ OTP valid → delete it
      await redisClient.del(pHash);
    }

    // Step 4: Build PII object
    const piiObject = {
      type: payload.type,
      name: payload.name,
      aadhaar: payload.type === "INDIAN" ? payload.aadhaar : null,
      passport: payload.type === "FOREIGN" ? payload.passport : null,
      email: payload.email || null,
      mobile: payload.mobile || null,
      emergencyContact: payload.emergencyContact || null,
      age: payload.age || null,
      gender: payload.gender || null,
      accommodation: payload.accommodation || null,
    };

    // Step 5: Encryption
    const dek = generateDek();
    const enc = encryptPayloadWithDek(dek, piiObject);
    const kek = getKek();
    const wrapped = wrapDekWithKek(kek, dek);

    // Step 6: Audit hash
    const auditInput = Buffer.concat([
      Buffer.from(enc.ciphertextB64, "base64"),
      Buffer.from(enc.ivB64, "base64"),
      Buffer.from(enc.tagB64, "base64"),
      Buffer.from(uniqueHash, "utf8"),
    ]);
    const auditHash = sha256Hex(auditInput);

    // Step 7: Save Tourist
    const created = await prisma.tourist.create({
      data: {
        aadhaarHash: uniqueHash,
        encryptedPayload: enc.ciphertextB64,
        payloadNonce: enc.ivB64,
        payloadTag: enc.tagB64,
        wrappedDek: wrapped.wrappedB64,
        wrappedDekNonce: wrapped.ivB64,
        wrappedDekTag: wrapped.tagB64,
        travelFrom,
        travelTo,
        consent: !!payload.consent,
        type: payload.type,
      },
    });

    const log = await prisma.blockchainLog.create({
      data: {
        touristId: created.id,
        auditHash,
        status: "PENDING",
      },
    });

    return res.status(201).json({
      success: true,
      touristId: created.id,
      blockchainLogId: log.id,
      auditHash,
      status: log.status,
    });
  } catch (err) {
    console.error("registerTourist ERR:", err);
    return res.status(500).json({ error: err.message });
  }
};
