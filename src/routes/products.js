const express = require('express');
const productsController = require('../controllers/products');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });  // Store file in memory

const router = express.Router();

router.get('/', productsController.getProducts);
router.post('/:id', upload.single('image'), productsController.uploadSupplierProduct);

module.exports = router;
