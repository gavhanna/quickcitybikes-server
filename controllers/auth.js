const crypto = require('crypto');
// const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
// const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');
const sendEmail = require('../utils/sendgrid');
const Settings = require('../models/Settings');
const { profile } = require('console');

// @desc        Register user
// @route       POST /api/v1/auth/register
// @access      Public
exports.register = asyncHandler(async (req, res, next) => {
  const { email, password, role, favourites } = req.body;

  // Create user
  try {
    const user = await User.create({
      email,
      password,
      role,
      favourites: favourites || [],
    });

    const settings = await Settings.create({ user: user.id });
    user.settings = settings;
    user.password = null;
    sendTokenResponse(user, 200, res);
    await sendEmail({
      to: email,
      from: 'test@example.com',
      subject: 'City Bikes TEST',
      text: `Hello ${email}, you have registered for the City Bikes app.`,
      html: `Hello ${email}, you have registered for the City Bikes app.`,
    });
  } catch (err) {
    return next(new ErrorResponse('Email already registered', 409));
  }
});

// @desc        Login user
// @route       POST /api/v1/auth/login
// @access      Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

  // Check for user
  const user = await User.findOne({ email })
    .select('+password')
    .populate('settings');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  user.password = null;

  sendTokenResponse(user, 200, res);
});

exports.googleLogin = asyncHandler(async (req, res, next) => {
  const { profileObj } = req.body;
  try {
    let user = await User.findOne({ googleId: profileObj.googleId })
      .select('+password')
      .populate('settings');

    if (!user) {
      user = await User.create(profileObj);
      const settings = await Settings.create({ user: user._id });
      user.settings = settings;
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    return next(new ErrorResponse(`Error: ${err}`, 500));
  }
});

// @desc        Get current user
// @route       POST /api/v1/auth/me
// @access      Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate('settings');

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc        Log user out / Clear cookie
// @route       GET /api/v1/auth/logout
// @access      Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie({
    token: 'none',
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc        Update user details
// @route       PUT /api/v1/auth/updatedetails
// @access      Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    username: req.body.username,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  await user.save();

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc        Update user password
// @route       PUT /api/v1/auth/updatepassword
// @access      Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse('Password is incorrect', 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc        Forgot password
// @route       POST /api/v1/auth/forgotpassword
// @access      Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse('There is no user with that email', 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const baseUrl =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : 'https://quickcitybikes.com';
  const resetUrl = `${baseUrl}/account/password-reset/${resetToken}`;

  const text = `You are receiving this email because you (or someone else) has requested the reset of a password. \nTo reset your password please visit ${resetUrl}. \nKind regards,\nQuickCityBikes`;
  const html = `<p>You are receiving this email because you (or someone else) has requested the reset of a password.</p> 
                <p>To reset your password please visit <a href="${resetUrl}">this link</a> and enter a new password.</p>
                <p>All the best,<br>QuickCityBikes</p>`;

  try {
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Password reset token',
    //   message,
    // });
    await sendEmail({
      to: user.email,
      from: 'info@quickcitybikes.com',
      subject: 'Password Reset',
      text: text,
      html: html,
    });

    res.status(200).json({
      success: true,
      data: 'Email sent',
    });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse(`Email could not be sent`, 500));
  }

  console.log(resetToken);

  // res.status(200).json({
  //     success: true,
  //     data: user
  // });
});

// @desc        Reset password
// @route       PUT /api/v1/auth/resetpassword/:resetToken
// @access      Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  console.log(req.body);
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');
  console.log(resetPasswordToken);

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).populate('settings');

  if (!user) {
    console.log(resetPasswordToken);

    return next(new ErrorResponse(`Invalid token`, 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();
  console.log(user);
  sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    // .cookie('token', token, options)
    .json({ success: true, token, user });
};
