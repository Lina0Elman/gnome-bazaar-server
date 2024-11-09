const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/suppliers');


router.get('/supplier-sales-info', supplierController.getSalesInfo);
router.get('/supplier-category-sales-info', supplierController.getCategorySalesInfo);
router.get('/supplier-products', supplierController.getSupplierProducts);
router.get('/supplier-locations', supplierController.getSupplierLocations);

module.exports = router;

