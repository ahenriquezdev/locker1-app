require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");
const connectDB = require("./config/database");
const mongoose = require("mongoose");

const passwordRoutes = require("./routes/passwords");
const groupsRoutes = require("./routes/groups");
const userRoutes = require("./routes/users");
const apiRoutes = require("./config/endpoints");
const responseHandler = require("./middleware/responseHandler");
const checkDbConnection = require("./middleware/checkDbConnection");

const app = express();
const PORT = process.env.PORT || 4002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(responseHandler);

// Connect to MongoDB
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Core API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });

// DB Connection Middleware
app.use(apiRoutes.base, checkDbConnection);

// Mount routes
app.use(apiRoutes.base, passwordRoutes);
app.use(apiRoutes.base, groupsRoutes);
app.use(apiRoutes.base, userRoutes);

app.get(`${apiRoutes.base}${apiRoutes.health}`, (req, res) => {
  res.sendSuccess(200, "Health check successful", {
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "core-api",
  });
});

// Load Swagger documentation
const swaggerDocument = YAML.load(path.join(__dirname, "swagger.yaml"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
