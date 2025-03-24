const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Global request logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date() });
});

// Mount password routes with explicit path logging
const passwordRoutes = require('./routes/passwordRoutes');
app.use('/passwords', (req, res, next) => {
    console.log('[DEBUG] Entering passwords namespace:', {
        method: req.method,
        originalUrl: req.originalUrl,
        path: req.path
    });
    next();
}, passwordRoutes);

// Swagger documentation
const swaggerDocument = YAML.load(path.join(__dirname, './swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    explorer: true
}));

// Print all registered routes
console.log('\n[STARTUP] All registered routes:');
function printRoutes(stack, prefix = '') {
    stack.forEach((r) => {
        if (r.route) {
            const methods = Object.keys(r.route.methods);
            console.log(`${methods.join(',')} ${prefix}${r.route.path}`);
        } else if (r.name === 'router') {
            console.log(`Router middleware at: ${r.regexp}`);
            if (r.handle.stack) {
                printRoutes(r.handle.stack, prefix + r.regexp.toString().replace('/^\\', '').replace('\\/?(?=\\/|$)/i', ''));
            }
        }
    });
}
printRoutes(app._router.stack);

// Error handler - must be before 404 handler
app.use((err, req, res, next) => {
    console.error('[ERROR]', err);
    // Ensure we send JSON responses for errors
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal server error'
    });
});

// 404 handler - must be last
app.use((req, res) => {
    console.log(`[404] ${req.method} ${req.originalUrl} not found`);
    // Ensure we send JSON responses for 404s
    res.status(404).json({
        status: 'error',
        message: `Cannot ${req.method} ${req.originalUrl}`
    });
});

module.exports = app; 