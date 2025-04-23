const NEXT_PUBLIC_GATEWAY_SERVICE_URL =
  process.env.NEXT_PUBLIC_GATEWAY_SERVICE_URL;

const apiRoutes = {
  remote: (() => {
    const apiUrl = `${NEXT_PUBLIC_GATEWAY_SERVICE_URL}/api/v1`;
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
        getCount: `${apiUrl}/core-api/passwords/count`,
        getLastUpdated: `${apiUrl}/core-api/passwords/last-updated`,
      },
      group: {
        getCount: `${apiUrl}/core-api/groups/count`,
        getAll: `${apiUrl}/core-api/groups`,
      },
      user: {
        getSecurityScore: `${apiUrl}/core-api/user/security-score`,
      },
    };
  })(),
};

export default apiRoutes;
