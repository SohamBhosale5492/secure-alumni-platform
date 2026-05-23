function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || error.status || 500;

  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation failed",
      errors: Object.values(error.errors).map((item) => item.message)
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      message: "A record with that unique value already exists.",
      field: Object.keys(error.keyValue || {})[0]
    });
  }

  return res.status(statusCode).json({
    message: error.message || "Internal server error"
  });
}

module.exports = errorHandler;
