const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const basicAuth = require('../middlewares/auth');

// Route to get all users
router.get('/users', userController.getAllUsers);

// Route to add a new user
router.post('/register', userController.addUser);
router.post('/update-user-profile/:id', userController.updateUser);

// Token generation route with authentication middleware
router.post('/token', basicAuth, userController.generateToken);

// Specific routes for categories and expenses (place these before the dynamic route)
router.get('/user-categories/:id', userController.getUserCategories);
router.get('/user-expenses/:id', userController.getUserExpenses);


// Get user profile by ID
router.get('/user-profile/:id', userController.getUserById);


// Route to get a specific user by ID
// router.get('/:id', userController.getUserById);

// Route to update a user
// router.put('/:id', userController.updateUser);


module.exports = router;
