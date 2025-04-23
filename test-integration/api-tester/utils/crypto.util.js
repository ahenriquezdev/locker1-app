const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const keyLength = 32;

async function generateEncryptionKey() {
  return crypto.randomBytes(keyLength);
}

async function encryptPassword(text, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'binary');
  encrypted += cipher.final('binary');

  return {
    iv: iv.toString('hex'),
    encryptedData: Buffer.from(encrypted, 'binary').toString('hex'),
  };
}

async function decryptPassword(encryptedDataHex, keyHex, ivHex) {
  const encryptedData = Buffer.from(encryptedDataHex, 'hex');
  const key = Buffer.from(keyHex, 'hex');
  const iv = Buffer.from(ivHex, 'hex');

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedData);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted;
}

module.exports = {
  generateEncryptionKey,
  encryptPassword,
  decryptPassword,
};
