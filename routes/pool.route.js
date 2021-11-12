'use strict'

const express = require('express');
const api = express.Router();
const poolController = require('../controllers/pool.controller');


// GET
api.get("/getPools", poolController.getPools);
api.get("/getPoolsName", poolController.getPoolsName);
api.get("/getPoolsData", poolController.getPoolsData);
api.get("/getPoolsDistinct", poolController.getPoolsDistinct);
api.get("/getPoolStatus", poolController.getPoolStatus);
api.get("/getPool/:id", poolController.getPool);
api.get("/getPoolsByDay", poolController.getPoolsByDay);

//POST
api.post("/addPool", poolController.addPool);
api.post("/addPools", poolController.addPools);
api.post("/editPool/:id", poolController.editPool);

module.exports = api;