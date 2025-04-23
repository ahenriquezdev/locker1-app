require("dotenv").config();

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;
const CORE_SERVICE_URL = process.env.CORE_SERVICE_URL;

const apiRoutes = {
  base: "/api/v1",
  docs: "/docs",
  health: "/health",

  authApi: (() => {
    const authApiLocalUrl = `/api/v1/auth-api`;
    const authApiRemoteUrl = `${AUTH_SERVICE_URL}/api/v1`;
    return {
      local: {
        base: authApiLocalUrl,
        docs: "/docs",
        health: "/health",
        auth: {
          register: "/auth/register",
          activate: "/auth/activate",
          login: "/auth/login",
          me: "/auth/me",
          validateToken: "/auth/validate-token",
        },
      },
      remote: {
        base: authApiRemoteUrl,
        docs: `${authApiRemoteUrl}/docs`,
        health: `${authApiRemoteUrl}/health`,
        auth: {
          register: `${authApiRemoteUrl}/auth/register`,
          activate: `${authApiRemoteUrl}/auth/activate`,
          login: `${authApiRemoteUrl}/auth/login`,
          me: `${authApiRemoteUrl}/auth/me`,
          validateToken: `${authApiRemoteUrl}/auth/validate-token`,
        },
      },
    };
  })(),

  coreApi: (() => {
    const coreApiLocalUrl = `/api/v1/core-api`;
    const coreApiRemoteUrl = `${CORE_SERVICE_URL}/api/v1`;
    return {
      local: {
        base: coreApiLocalUrl,
        docs: "/docs",
        health: "/health",
        password: {
          getAll: "/passwords",
          getById: "/password/:id",
          create: "/password",
          updateOrDelete: "/password/:id",
        },
      },
      remote: {
        base: coreApiRemoteUrl,
        docs: `${coreApiRemoteUrl}/docs`,
        health: `${coreApiRemoteUrl}/health`,
        password: {
          getAll: `${coreApiRemoteUrl}/passwords`,
          getById: `${coreApiRemoteUrl}/password/:id`,
          create: `${coreApiRemoteUrl}/password`,
          updateOrDelete: `${coreApiRemoteUrl}/password/:id`,
        },
      },
    };
  })(),
};

module.exports = apiRoutes;
