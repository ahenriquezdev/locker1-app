require("dotenv").config();

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;

const apiRoutes = {
  base: "/api/v1",
  docs: "/docs",
  health: "/health",
  password: {
    getAll: "/passwords",
    getById: "/password/:id",
    create: "/password",
    updateOrDelete: "/password/:id",
  },
};

module.exports = apiRoutes;
