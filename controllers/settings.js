const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Settings = require('../models/Settings');

// @desc        Get Settings
// @route       GET /api/v1/settings
// @access      Private
exports.getSettings = asyncHandler(async (req, res, next) => {
  const settings = await Settings.find({ id: req.user.id });

  if (!settings) {
    return next(new ErrorResponse(`Error retrieving settings`, 404));
  }

  console.log(settings);

  res.status(200).json({ success: true, data: settings.data });
});

// @desc        Update settings
// @route       PUT /api/v1/settings
// @access      Private
exports.updateSettings = asyncHandler(async (req, res, next) => {
  let settings = await Settings.findOne({ user: req.user.id });

  if (!settings) settings = new Settings({ user: req.user.id });

  try {
    settings = await Settings.findByIdAndUpdate(settings.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: settings });
  } catch (err) {
    console.log('Error updating settings:', err.message);

    return next(new ErrorResponse(err.message, 404));
  }
});
