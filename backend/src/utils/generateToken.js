const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  // Sign the token with the user's ID and the secret key from .env
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token is valid for 30 days
  });
};

module.exports = generateToken;