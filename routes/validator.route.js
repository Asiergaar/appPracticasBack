'use strict'

const express = require('express');
const api = express.Router();
const validatorController = require('../controllers/validator.controller');

//POST
api.post("/checkClient", validatorController.checkClient);
api.post("/checkExchange", validatorController.checkExchange);
api.post("/checkToken", validatorController.checkToken);
api.post("/checkPair", validatorController.checkPair);

module.exports = api;