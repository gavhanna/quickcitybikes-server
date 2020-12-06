const crypto = require('crypto');
const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

// @desc        Get all users
// @route       GET /api/v1/auth/users
// @access      Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc        Get single users
// @route       GET /api/v1/auth/users/:id
// @access      Private/Admin
// @note        In this case the id is actually the user's slug
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ slug: req.params.id }).populate('recipes');

  res.status(200).json({ success: true, data: user });
});

// @desc        Create users
// @route       POST /api/v1/auth/users
// @access      Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({ success: true, data: user });
});

// @desc        Update user
// @route       PUT /api/v1/auth/users/:id
// @access      Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const newValues = {
    $set: { favourites: req.body },
  };

  const user = await User.findByIdAndUpdate(req.params.id, newValues, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: user });
});

// @desc        Delete user
// @route       DELETE /api/v1/auth/users/:id
// @access      Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({ success: true, data: {} });
});
