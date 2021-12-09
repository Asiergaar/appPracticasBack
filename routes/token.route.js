'use strict'

const express = require('express');
const api = express.Router();
const tokenController = require('../controllers/token.controller');


// GET
api.get("/getTokens", tokenController.getTokens);
api.get("/getToken/:id", tokenController.getToken);

//POST
api.post("/addToken", tokenController.addToken);

// PUT
api.put("/editToken/:id", tokenController.editToken);

module.exports = api;