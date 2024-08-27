const express = require('express');
const farmerController = require('../controllers/farmerController');
const router = express.Router();

// CRUD routes
router.post('/', farmerController.createFarmer);
router.get('/', farmerController.getAllFarmers);
router.get('/:id', farmerController.getFarmerById);
router.put('/:id', farmerController.updateFarmer);
router.delete('/:id', farmerController.deleteFarmer);

// Approve or reject a farmer
router.put('/:id/approve', farmerController.approveOrRejectFarmer);

module.exports = router;
