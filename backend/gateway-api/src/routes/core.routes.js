const express = require("express");
const router = express.Router();
const apiRoutes = require("../config/endpoints");
const authMiddleware = require("../middleware/auth");

// [OK] get health
router.get(apiRoutes.coreApi.local.health, async (req, res) => {
  try {
    const response = await fetch(apiRoutes.coreApi.remote.health, {
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

// [] get all passwords
router.get(
  apiRoutes.coreApi.local.password.getAll,
  authMiddleware,
  async (req, res) => {
    try {
      const response = await fetch(apiRoutes.coreApi.remote.password.getAll, {
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
      res.sendError(500, "GW: Error getting passwords", error);
    }
  },
);

// [OK] get password by id
router.get(
  apiRoutes.coreApi.local.password.getById,
  authMiddleware,
  async (req, res) => {
    try {
      const passwordId = req.params.id;
      const remoteUrl = apiRoutes.coreApi.remote.password.getById.replace(
        ":id",
        passwordId,
      );
      const url = new URL(remoteUrl);

      const response = await fetch(url.toString(), {
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
      res.sendError(500, "GW: Error getting password", error);
    }
  },
);

// [OK] create a new password
router.post(
  apiRoutes.coreApi.local.password.create,
  authMiddleware,
  async (req, res) => {
    try {
      const response = await fetch(apiRoutes.coreApi.remote.password.create, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": req.user.userId,
          Authorization: `Bearer ${req.user.token}`,
        },
        body: JSON.stringify(req.body),
      });

      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).send(data);
      }
      res.status(response.status).send(data);
    } catch (error) {
      res.sendError(500, "GW: Error creating password", error);
    }
  },
);

// [OK] update password by id
router.put(
  apiRoutes.coreApi.local.password.updateOrDelete,
  authMiddleware,
  async (req, res) => {
    try {
      const id = req.params.id;
      const response = await fetch(
        apiRoutes.coreApi.remote.password.updateOrDelete.replace(":id", id),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-User-Id": req.user.userId,
            Authorization: `Bearer ${req.user.token}`,
          },
          body: JSON.stringify(req.body),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).send(data);
      }
      res.status(response.status).send(data);
    } catch (error) {
      res.sendError(500, "GW: Error updating password", error);
    }
  },
);

// [OK] delete password by id
router.delete(
  apiRoutes.coreApi.local.password.updateOrDelete,
  authMiddleware,
  async (req, res) => {
    try {
      const id = req.params.id;
      const response = await fetch(
        apiRoutes.coreApi.remote.password.updateOrDelete.replace(":id", id),
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "X-User-Id": req.user.userId,
            Authorization: `Bearer ${req.user.token}`,
          },
        },
      );

      const data = await response.json();
      if (!response.ok) {
        return res.status(response.status).send(data);
      }
      res.status(response.status).send(data);
    } catch (error) {
      res.sendError(500, "GW: Error deleting password", error);
    }
  },
);

module.exports = router;
