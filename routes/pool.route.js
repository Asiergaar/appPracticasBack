'use strict'

const express = require('express');
const api = express.Router();
const poolController = require('../controllers/pool.controller');


api.get("/getPools", poolController.getPools);
api.get("/getPool/:id", poolController.getPool);
api.post("/addPool", poolController.addPool);
api.post("/editPool/:id", poolController.editPool);

module.exports = api;