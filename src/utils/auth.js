const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn, allowedEmailDomain } = require('../config/db');

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

function comparePassword(password, passwordHash) {
  return bcrypt.compareSync(password, passwordHash);
}

function generateToken(user) {
  return jwt.sign(
    {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      full_name: user.full_name,
    },
    jwtSecret,
    { expiresIn: jwtExpiresIn }
  );
}

function verifyToken(token) {
  return jwt.verify(token, jwtSecret);
}

function validateHaUIEmail(email) {
  return typeof email === 'string' && email.toLowerCase().endsWith(`@${allowedEmailDomain}`);
}

function authenticateToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : header;

  if (!token) {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc thiếu Authorization.' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
  }
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập chức năng này.' });
    }
    next();
  };
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  validateHaUIEmail,
  authenticateToken,
  authorizeRoles,
};
