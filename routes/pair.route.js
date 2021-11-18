'use strict'

const express = require('express');
const api = express.Router();
const pairController = require('../controllers/pair.controller');

// GET
api.get("/getPairs", pairController.getPairs);
api.get("/getPairsName", pairController.getPairsName);
api.get("/getPair/:id", pairController.getPair);

//POST
api.post("/addPair", pairController.addPair);
api.post("/editPair/:id", pairController.editPair);

module.exports = api;