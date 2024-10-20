const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const purchasesController = require('../controllers/purchases');

// Route to get all users
router.get('/users', userController.getAllUsers);

// Route to add a new user
router.post('/register', userController.addUser);
router.post('/update-user-profile', userController.updateUser);

// Specific routes for categories and expenses (place these before the dynamic route)
router.get('/user-categories', userController.getUserCategories);
router.get('/user-expenses', userController.getUserExpenses);
router.get('/user-purchases', userController.getUserPurchases);

// cart
router.get('/cart-products', userController.getUserCartProducts);
router.post('/add-to-cart', userController.addToCart)
router.post('/remove-from-cart', userController.removeFromCart)
router.post('/submit-purchase', purchasesController.submitPurchase)

// Get user profile by ID
router.get('/user-profile', userController.getUserById);


module.exports = router;

