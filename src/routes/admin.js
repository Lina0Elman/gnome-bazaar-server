const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const adminAuth = require('../middlewares/adminAuth');


// Apply adminAuth middleware to all routes in this router
router.use(adminAuth);

// admin
router.get('/admin-sales-info', userController.getAdminSalesInfo);
router.post('/update-user-role', userController.updateUserRole);
router.post('/send-user-credits', userController.sendCreditsToUser);

module.exports = router;