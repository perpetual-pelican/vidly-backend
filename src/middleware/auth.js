const jwt = require('jsonwebtoken');
const { jwtPrivateKey } = require('../startup/config');

module.exports = function auth(req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).send('Access denied. No token provided.');

  try {
    const decoded = jwt.verify(token, jwtPrivateKey);
    req.user = decoded;

    return next();
  } catch (ex) {
    return res.status(400).send('Invalid token.');
  }
};
