const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const basicAuth = require('../middlewares/auth');

// Route to get all users
router.get('/', userController.getAllUsers);

// Route to get a specific user by ID
router.get('/:id', userController.getUserById);

// Route to update a user
router.put('/:id', userController.updateUser);

// Route to add a new user
router.post('/user', userController.addUser);

// Token generation route with authentication middleware
router.post('/token', basicAuth, userController.generateToken);

module.exports = router;
