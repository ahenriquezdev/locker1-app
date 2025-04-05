const apiRoutes = require("../config/endpoints");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.get("Authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    const response = await fetch(apiRoutes.remote.authApi.auth.validateToken, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return res.status(response.status).send(errorBody || response.statusText);
    }

    const responseData = await response.json();

    if (!responseData.data) {
      return res.status(response.status).send(response.statusText);
    }

    req.user = { ...responseData.data.decoded };

    next();
  } catch (error) {
    res.sendError(401, "GW: Error validating token", error);
  }
};

module.exports = authMiddleware;
