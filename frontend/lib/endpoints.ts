const API_URL = "http://localhost:5000/api/v1";

const remoteApi = {
  base: API_URL,
  auth: {
    login: `${API_URL}/auth/login`,
  },
  passwords: {
    getAll: `${API_URL}/passwords`,
    create: `${API_URL}/password/create`,
  },
};

export default remoteApi;
