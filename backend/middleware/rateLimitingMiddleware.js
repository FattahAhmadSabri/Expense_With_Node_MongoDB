const rateLimit = require("express-rate-limit");

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    message: "Too many login attempts. Try again after 15 minutes.",
  },
});

module.exports = { globalLimiter, loginLimiter };
