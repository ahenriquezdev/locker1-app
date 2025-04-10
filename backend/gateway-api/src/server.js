require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const coreRoutes = require("./routes/core.routes");
const apiRoutes = require("./config/endpoints");
const responseHandler = require("./middleware/responseHandler");

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(responseHandler);

// Mount routes
app.use(apiRoutes.authApi.local.base, authRoutes);
app.use(apiRoutes.coreApi.local.base, coreRoutes);

app.get(`${apiRoutes.base}${apiRoutes.health}`, (req, res) => {
  res.sendSuccess(200, "Health check successful", {
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "gateway-api",
  });
});

app.listen(PORT, () => {
  console.log(`Gateway API running on port ${PORT}.`);
});
