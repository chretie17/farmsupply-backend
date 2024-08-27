const express = require('express');
const traineeController = require('../controllers/traineeController');
const router = express.Router();

router.get('/dashboard', traineeController.getTraineeDashboard);

module.exports = router;
