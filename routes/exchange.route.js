'use strict'

const express = require('express');
const api = express.Router();
const exchangeController = require('../controllers/exchange.controller');

// GET
api.get("/getExchanges", exchangeController.getExchanges);
api.get("/getExchange/:id", exchangeController.getExchange);

//POST
api.post("/addExchange", exchangeController.addExchange);

// PUT
api.put("/editExchange/:id", exchangeController.editExchange);

module.exports = api;