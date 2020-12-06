const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc        Search
// @route       POST /api/v1/auth/register
// @access      Public
exports.search = model =>
  asyncHandler(async (req, res, next) => {
    const searchResults = await model.find({ $text: { $search: req.query.q } });
    if (!searchResults) {
      return next(
        new ErrorResponse(`Results not found with query ${req.query.q}`, 404)
      );
    }
    res.status(200).json({ success: true, data: searchResults });
  });
