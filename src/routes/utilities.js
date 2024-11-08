const express = require('express');
const {getAddress} = require("../controllers/utilities");
const router = express.Router();

router.get('/get-address', getAddress);

module.exports = router;