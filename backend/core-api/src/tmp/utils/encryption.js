const crypto = require('crypto');

// Generate a random encryption key
const generateEncryptionKey = () => {
    return crypto.randomBytes(32); // 256 bits for AES-256
};

// Generate a random IV
const generateIV = () => {
    return crypto.randomBytes(16); // 128 bits for AES
};

// Encrypt data using AES-256-GCM
const encrypt = (data, key, iv) => {
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    const authTag = cipher.getAuthTag();
    return {
        encrypted: encrypted,
        authTag: authTag
    };
};

// Decrypt data using AES-256-GCM
const decrypt = (encryptedData, key, iv, authTag) => {
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};

// Derive a key from password using PBKDF2
const deriveKey = (password, salt) => {
    return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
};

module.exports = {
    generateEncryptionKey,
    generateIV,
    encrypt,
    decrypt,
    deriveKey
}; 