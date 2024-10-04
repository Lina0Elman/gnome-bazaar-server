const express = require('express');
const productsController = require('../controllers/products');
const multer = require('multer');
const {authenticateToken} = require('../middlewares/auth');


const upload = multer({ storage: multer.memoryStorage() });  // Store file in memory

const router = express.Router();

router.get('/', productsController.getProducts);
router.post('/', authenticateToken, upload.single('image'), productsController.uploadSupplierProduct);

module.exports = router;
