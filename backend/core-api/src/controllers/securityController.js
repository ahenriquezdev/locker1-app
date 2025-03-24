const Password = require('../models/Password');
const { checkPasswordBreach } = require('../utils/hibpCheck');

const bulkBreachCheck = async (req, res) => {
    console.log('[DEBUG] Starting bulk breach check');
    try {
        // Get all passwords for the user
        const passwords = await Password.find({ userId: req.user.userId });
        console.log(`[DEBUG] Found ${passwords.length} passwords to check`);

        if (passwords.length === 0) {
            return res.json({
                status: 'success',
                data: {
                    totalChecked: 0,
                    compromisedCount: 0,
                    compromisedPasswords: []
                }
            });
        }

        // Check each password
        const results = await Promise.all(
            passwords.map(async (password) => {
                try {
                    // Decrypt and check the password
                    const result = await checkPasswordBreach(password.encryptedPassword);
                    return {
                        id: password._id,
                        title: password.title,
                        isCompromised: result.isCompromised,
                        timesExposed: result.timesExposed
                    };
                } catch (error) {
                    console.error(`[ERROR] Failed to check password ${password._id}:`, error);
                    return {
                        id: password._id,
                        title: password.title,
                        error: 'Failed to check this password'
                    };
                }
            })
        );

        // Filter compromised passwords
        const compromised = results.filter(r => r.isCompromised);
        console.log(`[DEBUG] Found ${compromised.length} compromised passwords`);

        return res.json({
            status: 'success',
            data: {
                totalChecked: passwords.length,
                compromisedCount: compromised.length,
                compromisedPasswords: compromised
            }
        });
    } catch (error) {
        console.error('[ERROR] Bulk breach check failed:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to perform bulk breach check',
            error: error.message
        });
    }
};

module.exports = {
    bulkBreachCheck
}; 