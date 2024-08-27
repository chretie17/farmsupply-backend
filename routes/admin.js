const express = require('express');
const adminController = require('../controllers/adminController');
const router = express.Router();

router.get('/dashboard', adminController.getAdminDashboard);

router.post('/trainings', adminController.createTraining);
router.get('/trainings', adminController.getTrainings);

module.exports = router;
