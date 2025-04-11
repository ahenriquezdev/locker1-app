const GATEWAY_SERVICE_URL = process.env.GATEWAY_SERVICE_URL;

const apiRoutes = {
  remote: (() => {
    const apiUrl = `${GATEWAY_SERVICE_URL}/api/v1`;
    return {
      base: apiUrl,
      docs: `${apiUrl}/docs`,
      health: `${apiUrl}/health`,
      auth: {
        register: `${apiUrl}/auth-api/auth/register`,
        login: `${apiUrl}/auth-api/auth/login`,
      },
      password: {
        getAll: `${apiUrl}/core-api/passwords`,
        getById: `${apiUrl}/core-api/password/:id`,
        create: `${apiUrl}/core-api/password`,
        updateOrDelete: `${apiUrl}/core-api/password/:id`,
      },
    };
  })(),
};

export default apiRoutes;
