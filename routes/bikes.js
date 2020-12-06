const express = require('express');
const {
  getStations,
  getContracts,
  getParkList,
  getStation,
} = require('../controllers/bikes');

// const User = require('../models/User');

const router = express.Router();

// const advancedResults = require('../middleware/advancedResults');
const { protect, authorise } = require('../middleware/auth');

// router.use(protect);
// router.use(authorise('user'));

router.route('/jcbikes/stations/:contract?').get(getStations);
router.route('/jcbikes/stations/:contract/:number').get(getStation);
router.route('/jcbikes/contracts').get(getContracts);
router.route('/jcbikes/parking/:contract').get(getParkList);

module.exports = router;
