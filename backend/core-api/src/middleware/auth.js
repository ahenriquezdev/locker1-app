const authMiddleware = async (req, res, next) => {
  try {
    const userId = req.get("X-User-ID");
    const authHeader = req.get("Authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!userId || !token) {
      return res.sendSuccess(401, "Access denied. Missing user credentials.");
    }

    req.user = {
      userId,
      token,
    };

    next();
  } catch (error) {
    res.sendError(401, "CO: Error validating identity", error);
  }
};

module.exports = authMiddleware;
