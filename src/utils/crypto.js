// src/utils/crypto.js
const crypto = require('crypto');

const ALGO = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits recommended for GCM
const DEK_LENGTH = 32; // 256-bit data encryption key

// Load KEK (Key Encryption Key) from env; expect base64
function getKek() {
  const b64 = process.env.KEK_BASE64;
  if (!b64) throw new Error('KEK_BASE64 not set in .env');
  const key = Buffer.from(b64, 'base64');
  if (key.length !== 32) throw new Error('KEK must be 32 bytes (base64-encoded)');
  return key;
}

// Generate a new random DEK (Buffer)
function generateDek() {
  return crypto.randomBytes(DEK_LENGTH);
}

// Encrypt JSON payload (object) with DEK using AES-256-GCM
// Returns base64 ciphertext, base64 iv, base64 authTag
function encryptPayloadWithDek(dekBuf, payloadObj) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, dekBuf, iv, { authTagLength: 16 });

  const plaintext = Buffer.from(JSON.stringify(payloadObj), 'utf8');
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    ciphertextB64: ciphertext.toString('base64'),
    ivB64: iv.toString('base64'),
    tagB64: authTag.toString('base64'),
  };
}

// Wrap (encrypt) DEK with KEK using AES-256-GCM (similar to key wrap)
function wrapDekWithKek(kekBuf, dekBuf) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGO, kekBuf, iv, { authTagLength: 16 });
  const wrapped = Buffer.concat([cipher.update(dekBuf), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    wrappedB64: wrapped.toString('base64'),
    ivB64: iv.toString('base64'),
    tagB64: authTag.toString('base64'),
  };
}

// Unwrap DEK (decrypt wrapped dek with KEK) - useful for local dev testing
function unwrapDekWithKek(kekBuf, wrappedB64, ivB64, tagB64) {
  const wrapped = Buffer.from(wrappedB64, 'base64');
  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(tagB64, 'base64');

  const dec = crypto.createDecipheriv(ALGO, kekBuf, iv, { authTagLength: 16 });
  dec.setAuthTag(authTag);
  const dek = Buffer.concat([dec.update(wrapped), dec.final()]);
  return dek;
}

// Compute SHA-256 hex hash for auditing (over any string or Buffer)
function sha256Hex(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

module.exports = {
  getKek,
  generateDek,
  encryptPayloadWithDek,
  wrapDekWithKek,
  unwrapDekWithKek,
  sha256Hex,
};
