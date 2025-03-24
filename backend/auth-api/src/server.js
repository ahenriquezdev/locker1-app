require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const encryptionRoutes = require('./routes/encryption');

const app = express();
const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Load Swagger documentation
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    explorer: true,
    swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'list',
        filter: true,
        showRequestHeaders: true,
        syntaxHighlight: {
            activated: true,
            theme: "monokai"
        },
        defaultModelsExpandDepth: 3,
        defaultModelExpandDepth: 3,
        displayRequestDuration: true,
        tryItOutEnabled: true
    },
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "Locker1 Auth API Documentation"
}));

// Routes
app.use('/auth', authRoutes);
app.use('/auth', encryptionRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'auth-api'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Internal Server Error'
    });
});

app.listen(PORT, () => {
    console.log(`Auth API running on port ${PORT}`);
}); 