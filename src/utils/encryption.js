// src/utils/encryption.js
const crypto = require("crypto");

// IMPORTANT: set MASTER_KEY_HEX in your env to persist across restarts
// 32 bytes hex (64 hex chars). If missing, we generate a random one (OK for dev only).
const MASTER_KEY_HEX = process.env.MASTER_KEY_HEX;
const MASTER_KEY = MASTER_KEY_HEX
  ? Buffer.from(MASTER_KEY_HEX, "hex")
  : (console.warn("⚠️ Using ephemeral MASTER_KEY (set MASTER_KEY_HEX in .env for persistence)"),
     crypto.randomBytes(32));

/**
 * Generate a fresh 256-bit Data Encryption Key (DEK).
 */
function generateDek() {
  return crypto.randomBytes(32);
}

/**
 * Encrypt arbitrary JSON-serializable data with DEK (used for Aadhaar/visa payloads).
 */
function encryptWithDek(data, dek) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", dek, iv);

  let enc = cipher.update(JSON.stringify(data), "utf8", "hex");
  enc += cipher.final("hex");
  const tag = cipher.getAuthTag().toString("hex");

  return { encrypted: enc, nonce: iv.toString("hex"), tag };
}

/**
 * Wrap a DEK using the master key (so we can safely store the DEK itself).
 */
function wrapDek(dek) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", MASTER_KEY, iv);

  let wrapped = cipher.update(dek, undefined, "hex"); // input Buffer → hex
  wrapped += cipher.final("hex");
  const tag = cipher.getAuthTag().toString("hex");

  return {
    wrappedDek: wrapped,
    wrappedDekNonce: iv.toString("hex"),
    wrappedDekTag: tag,
  };
}

/**
 * Hash value with SHA-256 (used for AadhaarHash, VisaIdHash, etc).
 */
function hashValue(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

/**
 * Encrypt a mobile number (direct with master key, since it’s small/simple).
 */
function encryptMobile(mobile) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", MASTER_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(mobile, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    encryptedMobile: encrypted.toString("hex"),
    mobileNonce: iv.toString("hex"),
    mobileTag: tag.toString("hex"),
  };
}

/**
 * Decrypt a mobile number.
 */
function decryptMobile(encryptedMobile, nonceHex, tagHex) {
  const iv = Buffer.from(nonceHex, "hex");
  const tag = Buffer.from(tagHex, "hex");

  const decipher = crypto.createDecipheriv("aes-256-gcm", MASTER_KEY, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encryptedMobile, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

module.exports = {
  generateDek,
  encryptWithDek,
  wrapDek,
  hashValue,
  encryptMobile,
  decryptMobile,
};
