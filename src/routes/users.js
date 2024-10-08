const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const purchasesController = require('../controllers/purchases');
const {authenticateToken} = require('../middlewares/auth');


// Route to get all users
router.get('/users', userController.getAllUsers);

// Route to add a new user
router.post('/register', userController.addUser);
router.post('/update-user-profile', authenticateToken, userController.updateUser);

// Specific routes for categories and expenses (place these before the dynamic route)
router.get('/user-categories', authenticateToken, userController.getUserCategories);
router.get('/user-expenses', authenticateToken, userController.getUserExpenses);
router.get('/user-purchases', authenticateToken, userController.getUserPurchases);

// cart
router.get('/cart-products', authenticateToken, userController.getUserCartProducts);
router.post('/add-to-cart', authenticateToken, userController.addToCart)
router.post('/remove-from-cart', authenticateToken, userController.removeFromCart)
router.post('/submit-purchase', authenticateToken, purchasesController.submitPurchase)

// Get user profile by ID
router.get('/user-profile', authenticateToken, userController.getUserById);


module.exports = router;

