const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }
  // Make sure token is exists
  if (!token) {
    return next(
      new ErrorResponse('Not authorised to access this route, no token', 401)
    );
  }
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    console.log('ERROR', err);

    return next(
      new ErrorResponse(
        'Not authorised to access this route, token verification failed',
        401
      )
    );
  }
});

// Grant access to specific roles
exports.authorise = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorised to access this route`,
          403
        )
      );
    }
    next();
  };
};
