const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController'); // Ensure the correct path to your controller

// Route to fetch report data
router.get('/', reportController.getReportData);

module.exports = router;
