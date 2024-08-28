const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Route for field officers to add products
router.post('/', productController.createProduct);

// Get all products
router.get('/', productController.getAllProducts);

// Get all farmers (for dropdown)
router.get('/farmers', productController.getAllFarmers);

// Update a product
router.put('/:id', productController.updateProduct);

// Delete a product
router.delete('/:id', productController.deleteProduct);

module.exports = router;
