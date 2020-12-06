const express = require('express');
const { getSettings, updateSettings } = require('../controllers/settings');

// const Settings = require('../models/Settings');

const router = express.Router();

// const advancedResults = require('../middleware/advancedResults');
const { protect, authorise } = require('../middleware/auth');

// router.use(protect);
// router.use(authorise('user'));

router.route('/').get(protect, getSettings).put(protect, updateSettings);

module.exports = router;
