'use strict'

const express = require('express');
const api = express.Router();
const clientController = require('../controllers/client.controller');

// GET
api.get("/getClients", clientController.getClients);
api.get("/getClient/:id", clientController.getClient);
api.get("/getClientsCapitals", clientController.getClientsCapitals);
api.get("/getClientMonthlyData", clientController.getClientMonthlyData);

// POST
api.post("/addClient", clientController.addClient);

// PUT
api.put("/editClient/:id", clientController.editClient);

module.exports = api;