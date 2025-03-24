const jwt = require('jsonwebtoken');
const axios = require('axios');

const authenticate = async (req, res, next) => {
    console.log('[DEBUG] Auth middleware executing for:', req.method, req.originalUrl);

    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        console.log('[DEBUG] Auth header:', authHeader ? 'Present' : 'Missing');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('[DEBUG] Invalid auth header format');
            return res.status(401).json({
                status: 'error',
                message: 'Authentication required'
            });
        }

        const token = authHeader.split(' ')[1];
        console.log('[DEBUG] Token extracted');

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('[DEBUG] Token verified for user:', decoded.id);

        // Get user data from auth service
        try {
            const response = await axios.get(`${process.env.AUTH_SERVICE_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Add user info to request object
            req.user = {
                ...decoded,
                ...response.data.data.user
            };

            next();
        } catch (error) {
            console.error('Error fetching user data:', error.message);
            return res.status(401).json({
                status: 'error',
                message: 'Invalid user session'
            });
        }
    } catch (error) {
        console.error('[ERROR] Auth middleware error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Authentication error'
        });
    }
};

module.exports = { authenticate }; 