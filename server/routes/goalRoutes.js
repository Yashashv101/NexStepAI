const express = require('express');
const { getGoals, createGoal } = require('../controllers/goalController');

const router = express.Router();

router.route('/').get(getGoals).post(createGoal);

module.exports = router;