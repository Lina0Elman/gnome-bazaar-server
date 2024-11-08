const express = require('express');
const {getWeather} = require("../controllers/utilities");
const router = express.Router();

router.get('/get-weather', getWeather);

module.exports = router;