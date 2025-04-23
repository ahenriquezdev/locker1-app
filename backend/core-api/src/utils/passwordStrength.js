const zxcvbn = require('zxcvbn');

function calculatePasswordStrength(password) {
    const result = zxcvbn(password);
    return {
        score: result.score,
        feedback: result.feedback.warning || result.feedback.suggestions[0] || ''
    };
}

module.exports = {
    calculatePasswordStrength
}; 