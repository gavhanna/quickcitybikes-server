const express = require('express');
const {
  getUser,
  getUsers,
  createUser,
  deleteUser,
  updateUser,
} = require('../controllers/users');
const { search } = require('../controllers/search');

const User = require('../models/User');

const router = express.Router();

const advancedResults = require('../middleware/advancedResults');
const { protect, authorise } = require('../middleware/auth');

// router.use(protect);
// router.use(authorise('user'));

router
  .route('/')
  .get(advancedResults(User, 'recipes'), getUsers)
  .post(createUser);

router.route('/search').get(search(User));

router
  .route('/:id')
  .get(getUser)
  .put(protect, authorise('user', 'admin'), updateUser)
  .delete(protect, authorise('user', 'admin'), deleteUser);

module.exports = router;
