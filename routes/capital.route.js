'use strict'

const express = require('express');
const api = express.Router();
const capitalController = require('../controllers/capital.controller');


api.post("/addCapitals", capitalController.addCapitals);
api.post("/newCapital", capitalController.newCapital);

module.exports = api;