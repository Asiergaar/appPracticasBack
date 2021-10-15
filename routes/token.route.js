'use strict'

const express = require('express');
const api = express.Router();
const tokenController = require('../controllers/token.controller');


api.get("/getTokens", tokenController.getTokens);
api.get("/getToken/:id", tokenController.getToken);
api.post("/addToken", tokenController.addToken);
api.post("/editToken/:id", tokenController.editToken);

module.exports = api;