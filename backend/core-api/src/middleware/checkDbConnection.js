const mongoose = require("mongoose");

const POST_PING_WAIT_TIME = 1500;

const checkDbConnection = async (req, res, next) => {
  // mongoose.connection.readyState:
  // 0 = disconnected
  // 1 = connected
  // 2 = connecting
  // 3 = disconnecting
  // 99 = uninitialized

  if (mongoose.connection.readyState === 1) {
    next();
  } else {
    console.warn(
      `DB not ready (${mongoose.connection.readyState}). Attempting ping for ${req.method} ${req.originalUrl}.`,
    );

    let pingSuccessful = false;
    try {
      if (mongoose.connection.db) {
        await mongoose.connection.db.admin().ping();
        console.log("Ping successful (DB responded).");
      } else {
        console.warn(
          "mongoose.connection.db object not available. Cannot perform ping.",
        );
      }
    } catch (pingError) {
      console.error(
        `Ping attempt failed for ${req.method} ${req.originalUrl}:`,
        pingError.message,
      );
    }

    console.log(
      `Waiting ${POST_PING_WAIT_TIME}ms after ping attempt for ${req.method} ${req.originalUrl} before re-checking state.`,
    );
    await new Promise((resolve) => setTimeout(resolve, POST_PING_WAIT_TIME));

    if (mongoose.connection.readyState === 1) {
      console.log(
        `DB connection ready after ping attempt and wait. Proceeding with ${req.method} ${req.originalUrl}.`,
      );
      next();
    } else {
      console.error(
        `DB connection still not ready (${mongoose.connection.readyState}) after ping attempt and wait. Blocking ${req.method} ${req.originalUrl}.`,
      );
      res.status(503).send({
        success: false,
        message:
          "CO: Database connection is not ready. Please try again shortly.",
        service: "auth-api",
        dbState: mongoose.connection.readyState,
      });
    }
  }
};

module.exports = checkDbConnection;
