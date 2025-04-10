require("dotenv").config();

const apiRoutes = {
  base: "/api/v1",
  docs: "/docs",
  health: "/health",
  auth: {
    register: "/auth/register",
    activate: "/auth/activate",
    login: "/auth/login",
    me: "/auth/me",
    validateToken: "/auth/validate-token",
  },
};

module.exports = apiRoutes;
