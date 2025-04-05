const express = require("express");
const router = express.Router();
const UserEncryptionKey = require("../models/UserEncryptionKey");
const authMiddleware = require("../middleware/auth");
const {
  generateEncryptionKey,
  generateIV,
  encrypt,
  decrypt,
} = require("../utils/encryption");

// Store encryption key for user
router.post("/encryption-key", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Generate new encryption key and IV if not provided
    const encryptionKey = req.body.key
      ? Buffer.from(req.body.key, "base64")
      : generateEncryptionKey();
    const iv = req.body.iv ? Buffer.from(req.body.iv, "base64") : generateIV();

    // Check if key already exists
    let userKey = await UserEncryptionKey.findOne({ userId });

    if (userKey) {
      userKey.encryptedKey = encryptionKey;
      userKey.iv = iv;
      await userKey.save();
    } else {
      userKey = new UserEncryptionKey({
        userId,
        encryptedKey: encryptionKey,
        iv,
      });
      await userKey.save();
    }

    res.status(201).json({
      status: "success",
      data: {
        key: encryptionKey.toString("base64"),
        iv: iv.toString("base64"),
      },
    });
  } catch (error) {
    console.error("Error storing encryption key:", error);
    res.status(500).json({
      status: "error",
      message: "Error storing encryption key",
    });
  }
});

// Retrieve encryption key for user
router.get("/encryption-key", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userKey = await UserEncryptionKey.findOne({ userId });

    if (!userKey) {
      return res.status(404).json({
        status: "error",
        message: "Encryption key not found",
      });
    }

    res.json({
      status: "success",
      data: {
        key: userKey.encryptedKey.toString("base64"),
        iv: userKey.iv.toString("base64"),
      },
    });
  } catch (error) {
    console.error("Error retrieving encryption key:", error);
    res.status(500).json({
      status: "error",
      message: "Error retrieving encryption key",
    });
  }
});

module.exports = router;
