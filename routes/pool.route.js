'use strict'

const express = require('express');
const api = express.Router();
const poolController = require('../controllers/pool.controller');


api.get("/getPools", poolController.getPools);
api.get("/getPoolsName", poolController.getPoolsName);
api.get("/getPoolsData", poolController.getPoolsData);
api.get("/getPoolsDistinct", poolController.getPoolsDistinct);
api.get("/getPoolStatus", poolController.getPoolStatus);
api.get("/getPool/:id", poolController.getPool);
api.post("/addPool", poolController.addPool);
api.post("/addPools", poolController.addPools);
api.post("/editPool/:id", poolController.editPool);
api.get("/getPoolsByDay", poolController.getPoolsByDay);

module.exports = api;