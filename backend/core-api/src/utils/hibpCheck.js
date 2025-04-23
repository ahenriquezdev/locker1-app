const axios = require('axios');
const crypto = require('crypto');

const HIBP_API_BASE = 'https://api.pwnedpasswords.com/range';

async function checkPasswordBreach(password) {
    try {
        // Generate SHA-1 hash of the password
        const hash = crypto.createHash('sha1')
            .update(password)
            .digest('hex')
            .toUpperCase();

        // Split hash into prefix and suffix for k-anonymity
        const prefix = hash.slice(0, 5);
        const suffix = hash.slice(5);

        // Query HIBP API with the prefix
        const response = await axios.get(`${HIBP_API_BASE}/${prefix}`, {
            headers: {
                'User-Agent': 'Locker1-PasswordManager'
            }
        });

        // Parse response and check if our hash suffix exists
        const hashes = response.data.split('\n');
        for (const hashLine of hashes) {
            const [hashSuffix, count] = hashLine.split(':');
            if (hashSuffix.trim() === suffix) {
                return {
                    isCompromised: true,
                    timesExposed: parseInt(count.trim(), 10)
                };
            }
        }

        return {
            isCompromised: false,
            timesExposed: 0
        };
    } catch (error) {
        console.error('HIBP API Error:', error.message);
        // Return null to indicate an error occurred
        return null;
    }
}

module.exports = { checkPasswordBreach }; 