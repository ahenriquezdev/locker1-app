require("dotenv").config();

const responseHandler = (req, res, next) => {
  console.log("Request received:", req.method, req.originalUrl);

  const isDevelopment = process.env.NODE_ENV === "development";

  const extractDebugInfo = (error) => {
    if (!isDevelopment || !error?.stack) return undefined;

    const stackLines = error.stack.split("\n");
    for (const line of stackLines) {
      if (
        line.includes("node:internal") ||
        line.includes("(internal/") ||
        line.includes("node_modules")
      ) {
        continue;
      }

      const match = line.match(/\(?(.+?):(\d+):(\d+)\)?/);
      if (match) {
        return {
          file: match[1].trim().replace(/^at /, ""),
          line: parseInt(match[2], 10),
          column: parseInt(match[3], 10),
        };
      }
    }
    return undefined;
  };

  res.sendResponse = (
    success,
    statusCode,
    message,
    data = null,
    errors = null,
    debug = undefined,
  ) => {
    return res.status(statusCode).json({
      success,
      statusCode,
      message,
      data,
      ...(isDevelopment && errors ? { errors } : {}),
      ...(isDevelopment && debug ? { debug } : {}),
    });
  };

  res.sendSuccess = (statusCode, message, data = null) => {
    return res.sendResponse(true, statusCode, message, data, null);
  };

  res.sendError = (statusCode, message, error = null) => {
    const debugInfo =
      isDevelopment && error ? extractDebugInfo(error) : undefined;

    const errorMessage =
      message ||
      "Unexpected error occurred. Please check the system logs for more information or contact your system administrator.";
    const errorDetails = isDevelopment
      ? [{ message: error?.message || message }]
      : [];

    return res.sendResponse(
      false,
      statusCode || 500,
      errorMessage,
      null,
      errorDetails,
      debugInfo,
    );
  };

  next();
};

module.exports = responseHandler;
