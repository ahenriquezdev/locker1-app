const express = require("express");
const router = express.Router();
const apiRoutes = require("../config/endpoints");
const authMiddleware = require("../middleware/auth");

// [OK] Get health
router.get(apiRoutes.authApi.local.health, async (req, res) => {
  try {
    const response = await fetch(apiRoutes.authApi.remote.health, {
      method: "GET",
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).send(data);
    }

    res.status(response.status).send(data);
  } catch (error) {
    res.sendError(500, "GW: Error getting health", error);
  }
});

// [OK] Register user
router.post(apiRoutes.authApi.local.auth.register, async (req, res) => {
  try {
    const response = await fetch(apiRoutes.authApi.remote.auth.register, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).send(data);
    }

    res.status(response.status).send(data);
  } catch (error) {
    res.sendError(500, "GW: Error registering user", error);
  }
});

// [OK] Activate user
router.get(apiRoutes.authApi.local.auth.activate, async (req, res) => {
  try {
    const url = new URL(apiRoutes.authApi.remote.auth.activate);

    Object.keys(req.query).forEach((key) => {
      url.searchParams.append(key, req.query[key]);
    });

    const response = await fetch(url.toString(), {
      method: "GET",
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).send(data);
    }

    res.status(response.status).send(data);
  } catch (error) {
    res.sendError(500, "GW: Error activating user", error);
  }
});

// [OK] Login user
router.post(apiRoutes.authApi.local.auth.login, async (req, res) => {
  try {
    const response = await fetch(apiRoutes.authApi.remote.auth.login, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).send(data);
    }

    res.status(response.status).send(data);
  } catch (error) {
    res.sendError(500, "GW: Error logging in user", error);
  }
});

// [] Get current user
router.get(
  apiRoutes.authApi.local.auth.me,
  authMiddleware,
  async (req, res) => {
    try {
      const response = await fetch(apiRoutes.authApi.remote.auth.me, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": req.user.userId,
          Authorization: `Bearer ${req.user.token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).send(data);
      }

      res.status(response.status).send(data);
    } catch (error) {
      res.sendError(500, "GW: Error getting current user", error);
    }
  },
);

module.exports = router;
