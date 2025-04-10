require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");
const connectDB = require("./config/database");

const authRoutes = require("./routes/auth");
const apiRoutes = require("./config/endpoints");
const responseHandler = require("./middleware/responseHandler");

const app = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(responseHandler);

// Connect to MongoDB
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Auth API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });

// Mount routes
app.use(apiRoutes.base, authRoutes);

app.get(`${apiRoutes.base}${apiRoutes.health}`, (req, res) => {
  res.sendSuccess(200, "Health check successful", {
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "auth-api",
  });
});

// Load Swagger documentation
// const swaggerDocument = YAML.load(path.join(__dirname, "swagger.yaml"));
// app.use(
//   apiRoutes.internal.docs,
//   swaggerUi.serve,
//   swaggerUi.setup(swaggerDocument, {
//     explorer: true,
//     swaggerOptions: {
//       persistAuthorization: true,
//       docExpansion: "list",
//       filter: true,
//       showRequestHeaders: true,
//       syntaxHighlight: {
//         activated: true,
//         theme: "monokai",
//       },
//       defaultModelsExpandDepth: 3,
//       defaultModelExpandDepth: 3,
//       displayRequestDuration: true,
//       tryItOutEnabled: true,
//     },
//     customCss: ".swagger-ui .topbar { display: none }",
//     customSiteTitle: "Locker1 Auth API Documentation",
//   }),
// );
