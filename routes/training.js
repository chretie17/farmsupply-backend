const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingController');

router.post('/',  trainingController.createTraining);

router.get('/',  trainingController.getAllTrainings);

router.get('/:id', trainingController.getTrainingById);

router.put('/:id',  trainingController.updateTraining);

router.delete('/:id', trainingController.deleteTraining);
router.get('/field-officer/trainings', trainingController.getAllTrainings);

// Route to view a specific training PDF by ID
router.get('/:id/pdf', trainingController.getTrainingPdfById);

module.exports = router;
