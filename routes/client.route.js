'use strict'

const express = require('express');
const api = express.Router();
const clientController = require('../controllers/client.controller');


api.get("/getClients", clientController.getClients);
api.get("/getClient/:id", clientController.getClient);
api.post("/addClient", clientController.addClient);
api.post("/editClient/:id", clientController.editClient);

module.exports = api;