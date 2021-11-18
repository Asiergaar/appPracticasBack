'use strict'

const express = require('express');
const api = express.Router();
const progressController = require('../controllers/progress.controller');


// GET
api.get("/addProgress", progressController.addProgress);
api.get("/checkProgress", progressController.checkProgress);
api.get("/minusDate", progressController.minusDate);

module.exports = api;