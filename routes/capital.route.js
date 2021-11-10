'use strict'

const express = require('express');
const api = express.Router();
const capitalController = require('../controllers/capital.controller');

api.get("/getCapitals", capitalController.getCapitals);
api.get("/getMonthTotals", capitalController.getMonthTotals);

api.post("/addCapitals", capitalController.addCapitals);
api.post("/newCapital", capitalController.newCapital);
api.post("/setCapital", capitalController.setCapital);

module.exports = api;