const express = require("express");
const router = express.Router();
const apiRoutes = require("../config/endpoints");
const { User: Users } = require("../models/index");
const authMiddleware = require("../middleware/auth");

// [OK] get user security score
router.get(
  apiRoutes.user.getSecurityScore,
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.user.userId;
      const user = await Users.findById(userId);
      if (!user) {
        return res.sendError(404, "Users not found");
      }
      return res.sendSuccess(200, "Security score retrieved successfully.", {
        securityScore: user.securityScore,
      });
    } catch (error) {
      return res.sendError(500, "AU: Update security score failed", error);
    }
  },
);

module.exports = router;
