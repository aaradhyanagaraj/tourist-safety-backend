const crypto = require("crypto");

// Master Key (like KMS or env secret)
const MASTER_KEY = crypto.randomBytes(32); // In real, store in env

function encryptPayload(payload) {
  const dek = crypto.randomBytes(32); // Data Encryption Key
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv("aes-256-gcm", dek, iv);
  let encrypted = cipher.update(JSON.stringify(payload), "utf8", "hex");
  encrypted += cipher.final("hex");
  const tag = cipher.getAuthTag();

  // Wrap DEK with Master Key
  const dekIv = crypto.randomBytes(16);
  const dekCipher = crypto.createCipheriv("aes-256-gcm", MASTER_KEY, dekIv);
  let wrappedDek = dekCipher.update(dek, null, "hex");
  wrappedDek += dekCipher.final("hex");
  const dekTag = dekCipher.getAuthTag();

  return {
    encryptedData: encrypted,
    nonce: iv.toString("hex"),
    tag: tag.toString("hex"),
    wrappedDek,
    wrappedDekNonce: dekIv.toString("hex"),
    wrappedDekTag: dekTag.toString("hex"),
  };
}

function hashValue(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

module.exports = { encryptPayload, hashValue };
