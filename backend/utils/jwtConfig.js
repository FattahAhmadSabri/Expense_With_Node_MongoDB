const jwt = require("jsonwebtoken");
const secretKey = process.env.JWT_SECRET;
const generateToken = (id) => {
  return jwt.sign({ id }, secretKey, {
    expiresIn: "5h",
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, secretKey);
};

module.exports = { generateToken, verifyToken };
