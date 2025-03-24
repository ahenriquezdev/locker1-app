const crypto = require('crypto');
const axios = require('axios');

const AUTH_API_URL = 'http://localhost:3001';

// Fetch user's encryption key from auth service
async function getUserEncryptionKey(authToken) {
    try {
        if (!authToken) {
            throw new Error('No authorization token provided');
        }

        const response = await axios.get(`${AUTH_API_URL}/auth/encryption-key`, {
            headers: {
                'Authorization': authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`
            }
        });

        if (!response.data || !response.data.data || !response.data.data.key || !response.data.data.iv) {
            throw new Error('Invalid encryption key data received');
        }

        return {
            key: response.data.data.key,
            iv: response.data.data.iv
        };
    } catch (error) {
        console.error('Error fetching encryption key:', error.message);
        if (error.response) {
            console.error('Auth service response:', error.response.data);
        }
        throw new Error('Failed to retrieve encryption key');
    }
}

// Encrypt password using user's encryption key
async function encryptPassword(password, authToken) {
    try {
        const { key } = await getUserEncryptionKey(authToken);
        const keyBuffer = Buffer.from(key, 'base64');
        const ivBuffer = crypto.randomBytes(12);

        const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, ivBuffer);
        let encrypted = cipher.update(password, 'utf8', 'base64');
        encrypted += cipher.final('base64');

        const authTag = cipher.getAuthTag();

        return {
            encryptedPassword: encrypted,
            iv: ivBuffer.toString('base64'),
            authTag: authTag.toString('base64')
        };
    } catch (error) {
        console.error('Encryption error details:', error);
        throw new Error('Encryption failed: ' + error.message);
    }
}

// Decrypt password using user's encryption key
async function decryptPassword(encryptedPassword, iv, authTag, token) {
    try {
        const { key } = await getUserEncryptionKey(token);
        const keyBuffer = Buffer.from(key, 'base64');
        const ivBuffer = Buffer.from(iv, 'base64');
        const authTagBuffer = Buffer.from(authTag, 'base64');
        const encryptedBuffer = Buffer.from(encryptedPassword, 'base64');

        const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, ivBuffer);
        decipher.setAuthTag(authTagBuffer);

        let decrypted = decipher.update(encryptedBuffer);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return decrypted.toString('utf8');
    } catch (error) {
        console.error('Decryption error details:', error);
        throw new Error('Decryption failed: ' + error.message);
    }
}

module.exports = {
    encryptPassword,
    decryptPassword
}; 