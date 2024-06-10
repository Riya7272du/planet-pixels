const { Error } = require("mongoose");
const AppError = require("./../utils/AppError");

const handleJsonWebTokenError = (err) => {
  return new AppError("Invalid token.Please login again", 401);
};

const handleTokenExpiredError = (err) => {
  return new AppError("Token expired. Please login again", 401);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("ERROR : ", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong!!",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };

    if (error.name === "JsonWebTokenError")
      error = handleJsonWebTokenError(err);

    if (error.name === "TokenExpiredError")
      error = handleTokenExpiredError(err);

    sendErrorProd(error, res);
  }
};
