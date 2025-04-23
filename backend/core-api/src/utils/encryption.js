const crypto = require("crypto");

const KEY_LENGTH = 32;
const IV_LENGTH = 12;
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_DIGEST = "sha256";

const generateEncryptionKey = () => {
  return crypto.randomBytes(KEY_LENGTH);
};

const generateIV = () => {
  return crypto.randomBytes(IV_LENGTH).toString("base64");
};

const encrypt = (data, key) => {
  const iv = generateIV();
  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(iv, "base64"),
  );
  let encrypted = cipher.update(data, "utf8", "base64");
  encrypted += cipher.final("base64");
  const authTag = cipher.getAuthTag().toString("base64");
  return {
    encrypted: encrypted,
    authTag: authTag,
    iv: iv,
  };
};

const decrypt = (encryptedData, key, iv, authTag) => {
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(iv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(authTag, "base64"));
  let decrypted = decipher.update(encryptedData, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

const deriveKey = (userIdOrEmail, salt) => {
  return crypto.pbkdf2Sync(
    userIdOrEmail,
    salt,
    PBKDF2_ITERATIONS,
    KEY_LENGTH,
    PBKDF2_DIGEST,
  );
};

const generateUserEncryptionKeyData = (userIdOrEmail) => {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = deriveKey(userIdOrEmail, salt);
  const iv = generateIV();
  return { salt, derivedKey, iv };
};

const getMasterKey = () => {
  const masterKeyHex = process.env.APP_MASTER_KEY;
  return Buffer.from(masterKeyHex, "hex");
};

module.exports = {
  generateEncryptionKey,
  generateIV,
  encrypt,
  decrypt,
  deriveKey,
  generateUserEncryptionKeyData,
  getMasterKey,
};
