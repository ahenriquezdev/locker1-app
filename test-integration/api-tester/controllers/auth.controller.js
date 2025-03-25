const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const { User, AuthToken, UserEncryptionKey } = require("../models");
const jwt = require("jsonwebtoken");
const { sequelize } = require("../models");
const { getExpiresAtUtc, hideUUID, showUUID } = require("../utils/helper.util");

const MASTER_KEY = Buffer.from(process.env.APP_MASTER_KEY, "hex");
const JWT_SECRET = process.env.JWT_SECRET;
const SESSION_EXPIRY = process.env.JWT_SESSION_EXPIRES_IN;
const ACTIVATION_EXPIRY = process.env.JWT_ACTIVATION_EXPIRES_IN;

const createUser = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { full_name, email, password } = req.body;
    const activationExpiry = getExpiresAtUtc(ACTIVATION_EXPIRY);

    const existingUser = await User.findOne({ where: { email }, transaction });
    if (existingUser) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "User with this email already exists",
        data: null,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create(
      {
        id: uuidv4(),
        full_name,
        email,
        password: hashedPassword,
        is_active: false,
      },
      { transaction },
    );

    const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: parseInt(ACTIVATION_EXPIRY, 10),
    });

    const tokenEntry = await AuthToken.create(
      {
        user_id: user.id,
        token,
        type: "activation",
        expires_at: activationExpiry,
      },
      { transaction },
    );

    const hiddenTokenId = hideUUID(tokenEntry.id);

    await transaction.commit();

    return res.status(201).json({
      success: true,
      statusCode: 201,
      message: "User created successfully",
      data: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        activationToken: hiddenTokenId,
      },
    });
  } catch (error) {
    if (transaction) await transaction.rollback();

    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal Server Error",
      data: null,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const activateUser = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { token: activationToken } = req.params;

    const hiddenTokenId = showUUID(activationToken);

    const tokenEntry = await AuthToken.findOne({
      where: { id: hiddenTokenId },
      transaction,
    });

    if (!tokenEntry) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: "Invalid activation token",
        data: null,
      });
    }

    const user = await User.findByPk(tokenEntry.user_id, { transaction });
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: "User not found",
        data: null,
      });
    }

    user.is_active = true;
    await user.save({ transaction });
    await AuthToken.destroy({ where: { id: tokenEntry.id }, transaction });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "User activated successfully",
      data: null,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();

    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal Server Error",
      data: null,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const loginUserWithCredentials = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { email, password } = req.body;

    const sessionExpiresAt = getExpiresAtUtc(SESSION_EXPIRY);

    const user = await User.scope("withPassword").findOne({
      where: { email, is_active: true },
      transaction,
    });
    if (!user) {
      await transaction.rollback();
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Invalid email or password",
        data: null,
      });
    }

    const storedPassword = user.password.toString();
    const passwordMatch = await bcrypt.compare(password, storedPassword);

    if (!passwordMatch) {
      await transaction.rollback();
      return res.status(401).json({
        success: false,
        statusCode: 401,
        message: "Invalid email or password",
        data: null,
      });
    }

    const token = jwt.sign(
      { sub: user.id, name: user.full_name, email: user.email },
      JWT_SECRET,
      { expiresIn: parseInt(SESSION_EXPIRY, 10) },
    );

    await AuthToken.create(
      {
        user_id: user.id,
        token,
        type: "session",
        expires_at: sessionExpiresAt,
      },
      { transaction },
    );

    await User.update(
      { last_login_at: new Date() },
      {
        where: { id: user.id },
        transaction,
      },
    );

    await transaction.commit();

    res.cookie("session_token", token, {
      httpOnly: true,
      secure: true,
      maxAge: parseInt(SESSION_EXPIRY, 10),
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "User logged in successfully",
      data: {
        id: user.id,
        name: user.full_name,
        email: user.email,
        token,
      },
    });
  } catch (error) {
    if (transaction) await transaction.rollback();

    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal Server Error",
      data: null,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const revokeToken = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    await AuthToken.destroy({ where: { token } });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Token revoked successfully",
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: "Internal Server Error",
      data: null,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getMe = async (req, res) => {
  // get token from header and calculate expiry
  const authHeader = req.headers["authorization"];
  const authToken = authHeader?.split(" ")[1];
  const token = authToken ?? req.cookies?.session_token;

  if (!token) {
    return res.status(401).json({
      success: false,
      statusCode: 401,
      message: "Token not provided.",
      data: null,
    });
  }

  const userId = req.user.sub;

  const userEntry = await User.findByPk(userId);
  if (!userEntry) {
    return res.status(404).json({
      success: false,
      statusCode: 404,
      message: "User not found",
      data: null,
    });
  }

  const decodedToken = jwt.verify(token, JWT_SECRET);

  const expiresAt = new Date(decodedToken.exp * 1000);

  const now = new Date().getTime();
  const diff = expiresAt.getTime() - now;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const utcDiff = `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;

  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: "User details fetched successfully",
    data: {
      id: req.user.sub,
      name: req.user.name,
      email: req.user.email,
      timeRemaining: utcDiff,
    },
  });
};

module.exports = {
  createUser,
  activateUser,
  loginUserWithCredentials,
  getMe,
};
