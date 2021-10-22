'use strict'

const express = require('express');
const api = express.Router();
const progressController = require('../controllers/progress.controller');


api.get("/addProgress", progressController.addProgress);

module.exports = api;