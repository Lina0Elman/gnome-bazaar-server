const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const {basicAuth} = require('../middlewares/auth');



// Token generation route with authentication middleware
router.post('/', basicAuth, authController.generateToken);


module.exports = router;

