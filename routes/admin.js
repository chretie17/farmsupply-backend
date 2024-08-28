// adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/metrics', adminController.getMetrics);

router.get('/orders-per-day', adminController.getOrdersPerDay);

router.get('/products-per-day', adminController.getProductsPerDay);
router.get('/weekly-revenue', adminController.getWeeklyRevenue);
router.get('/orders', adminController.getAllOrders);

// Route to download an invoice
router.get('/orders/invoice/:id', adminController.downloadInvoice);

module.exports = router;
