const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

router.use(cookieParser()); // Ensure this line is present

// Middleware to check authentication
const checkAuth = (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ isAuthenticated: false, message: 'No token provided' });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    res.json({ isAuthenticated: true });
  } catch (err) {
    console.error('JWT verification error:', err);
    res.status(401).json({ isAuthenticated: false, message: 'Invalid token' });
  }
};

router.get('/check-auth', checkAuth);

module.exports = router;
