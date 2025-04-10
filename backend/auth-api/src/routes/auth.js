const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
const mongoose = require("mongoose");

const apiRoutes = require("../config/endpoints");
const AuthToken = require("../models/AuthToken");
const util = require("util");

const jwtVerifyPromise = util.promisify(jwt.verify);

// [OK] Register new user
router.post(apiRoutes.auth.register, async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.sendError(400, "Email already registered");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      email,
      password: passwordHash,
      fullName,
      isActive: false,
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: parseInt(process.env.JWT_ACTIVATION_EXPIRES_IN, 10) },
    );

    // Generate authToken entry
    const authToken = new AuthToken({
      userId: user._id,
      token,
      type: "activation",
      expiresAt: new Date(
        Date.now() + parseInt(process.env.JWT_ACTIVATION_EXPIRES_IN, 10) * 1000,
      ),
    });

    await authToken.save();

    // TODO: Send activation email

    res.sendSuccess(201, "User registered successfully", {
      user: user.getPublicFields(),
      token: authToken._id,
    });
  } catch (error) {
    res.sendError(500, "AU: User registration failed", error);
  }
});

// [OK] Activate user
router.get(apiRoutes.auth.activate, async (req, res) => {
  try {
    const tokenId = req.query?.token ?? null;

    if (!tokenId) {
      return res.sendError(400, "Missing activation token");
    }

    try {
      if (!mongoose.Types.ObjectId.isValid(tokenId)) {
        return res.sendError(
          400,
          `Invalid activation token format. ${tokenId}`,
        );
      }
    } catch (error) {
      return res.sendError(400, "Invalid activation token");
    }

    const tokenEntry = await AuthToken.findById(tokenId);
    if (!tokenEntry) {
      return res.sendError(400, "Invalid activation token");
    }

    const expiresAtMillis = new Date(tokenEntry.expiresAt).getTime();

    if (expiresAtMillis < Date.now()) {
      await tokenEntry.deleteOne();
      return res.sendError(401, "Activation token entry expired");
    }

    const user = await User.findById(tokenEntry.userId);
    if (!user) {
      return res.sendError(404, "Account not found");
    }

    user.isActive = true;
    await user.save();
    await tokenEntry.deleteOne();
    res.sendSuccess(200, "Account activated successfully");
  } catch (error) {
    res.sendError(500, "AU: Account activation failed", error);
  }
});

// [OK] Login
router.post(apiRoutes.auth.login, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.sendError(401, "Invalid email or password");
    }

    // Check if account is active
    if (!user.isActive) {
      return res.sendError(401, "Your account is currently inactive");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.sendError(401, "Invalid password");
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: parseInt(process.env.JWT_SESSION_EXPIRES_IN, 10) },
    );

    // Generate authToken entry
    const authToken = new AuthToken({
      userId: user._id,
      token,
      type: "session",
      expiresAt: new Date(
        Date.now() + parseInt(process.env.JWT_SESSION_EXPIRES_IN, 10) * 1000,
      ),
    });

    await authToken.save();

    res.sendSuccess(200, "Login successful", {
      user: user.getPublicFields(),
      token,
    });
  } catch (error) {
    res.sendError(500, "AU: Login failed", error);
  }
});

// [OK] Get current user (protected route)
router.get(apiRoutes.auth.me, authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.sendError(404, "User not found");
    }

    res.sendSuccess(200, "User session details", {
      user: user.getPublicFields(),
    });
  } catch (error) {
    res.sendError(500, "AU: Get user failed", error);
  }
});

// [OK] Validate token
router.post(apiRoutes.auth.validateToken, async (req, res) => {
  try {
    const authHeader = req.get("Authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      return res.sendError(401, "No token provided, authorization denied.");
    }

    const tokenEntry = await AuthToken.findOne({ token });
    if (!tokenEntry) {
      return res.sendError(400, "Token entry not found.");
    }

    const expiresAtMillis = new Date(tokenEntry.expiresAt).getTime();

    if (expiresAtMillis < Date.now()) {
      await tokenEntry.deleteOne();
      return res.sendError(401, "Token entry expired");
    }

    const decoded = await validateToken(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.sendError(401, "User not found");
    }

    res.sendSuccess(200, "Token is valid", { decoded });
  } catch (error) {
    if (error.statusCode && error.message) {
      return res.sendError(error.statusCode, error.message);
    }
    res.sendError(500, "AU: Token validation failed", error);
  }
});

// helper

async function validateToken(token, secret) {
  try {
    const decoded = await jwtVerifyPromise(token, secret);
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw { message: "Token expired", statusCode: 401 };
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw { message: "Not a valid JWT token", statusCode: 403 };
    } else {
      throw { message: "Error validating token", statusCode: 403 };
    }
  }
}

module.exports = router;
