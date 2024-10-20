const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/suppliers');
const {authenticateToken} = require('../middlewares/auth');


// Route to get all users
router.get('/supplier-sales-info', supplierController.getSalesInfo);
router.get('/supplier-category-sales-info', supplierController.getCategorySalesInfo);
router.get('/supplier-products', supplierController.getSupplierProducts);

module.exports = router;

