require("dotenv").config();

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;
const CORE_SERVICE_URL = process.env.CORE_SERVICE_URL;

const apiRoutes = {
  internal: {
    base: "/api/v1",
    docs: "/docs",
    health: "/health",
    authApi: (() => {
      const authApiUrl = "/remote/auth-api";
      return {
        docs: `${authApiUrl}/docs`,
        health: `${authApiUrl}/health`,
        auth: {
          register: `${authApiUrl}/auth/register`,
          activate: `${authApiUrl}/auth/activate`,
          login: `${authApiUrl}/auth/login`,
          me: `${authApiUrl}/auth/me`,
          validateToken: `${authApiUrl}/auth/validate-token`,
        },
      };
    })(),
  },
  remote: {
    authApi: (() => {
      const authApiUrl = `${AUTH_SERVICE_URL}/api/v1`;
      return {
        base: authApiUrl,
        docs: `${authApiUrl}/docs`,
        health: `${authApiUrl}/health`,
        auth: {
          register: `${authApiUrl}/auth/register`,
          activate: `${authApiUrl}/auth/activate`,
          login: `${authApiUrl}/auth/login`,
          me: `${authApiUrl}/auth/me`,
          validateToken: `${authApiUrl}/auth/validate-token`,
        },
      };
    })(),
  },
};

module.exports = apiRoutes;
