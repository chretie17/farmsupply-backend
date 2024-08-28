const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/', orderController.createOrder);
router.get('/', orderController.getAllOrders);
router.put('/:id/status', orderController.updateOrderStatus);
router.put('/:id/schedule-delivery', orderController.scheduleDelivery);
router.get('/:id/invoice', orderController.getInvoice); 

module.exports = router;
