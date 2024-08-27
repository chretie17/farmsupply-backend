const express = require('express');
const fieldOfficerController = require('../controllers/fieldOfficerController');
const router = express.Router();

router.get('/dashboard', fieldOfficerController.getFieldOfficerDashboard);

module.exports = router;
