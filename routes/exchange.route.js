'use strict'

const express = require('express');
const api = express.Router();
const exchangeController = require('../controllers/exchange.controller');


api.get("/getExchanges", exchangeController.getExchanges);
api.get("/getExchange/:id", exchangeController.getExchange);
api.post("/addExchange", exchangeController.addExchange);
api.post("/editExchange/:id", exchangeController.editExchange);

module.exports = api;