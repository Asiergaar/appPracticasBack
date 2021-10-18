'use strict'

const Progress = require('../models/progress.model');
const Capital = require('../models/capital.model');
const Client = require('../models/client.model');

// GET /clients
async function getClients (req, res) {
    const clients = await Client.findAll();
    return res.status(200).send({
        message: 'success',
        data: clients
    });
}

// GET /client/id
async function getClient (req, res) {
    const id = req.params.id;
    const client = await Client.findAll({
        where: {
          client_id: id
        }
    });
    return res.status(200).send({
        message: 'success',
        data: client
    });
}

// POST /client/create
async function addClient (req, res) {
    var entry_date = Date();
    const client = await Client.create({
        client_name: req.body.client_name,
        client_surname: req.body.client_surname,
        email: req.body.email,
        entry_date: entry_date,
        start_capital: req.body.start_capital
    });
    // Add first progress and capital to database
    const progress = await Progress.create({
        progress_date: entry_date,
        progress_percentage: 0
    });
    const capital = await Capital.create({
        capital_client: client.client_id,
        capital_date: entry_date,
        capital_quantity: client.start_capital,
        capital_progress: progress.progress_id
    });
    return res.status(200).send({
        message: 'success',
        data: client
    });
}

// POST /client/edit/2
async function editClient (req, res) {
    const id = req.params.id;
    const client = await Client.update({ 
        client_name: req.body.client_name,
        client_surname: req.body.client_surname,
        email: req.body.email }, {
        where: {
            client_id: id
        }
    })
    .then(async (result) => {
        const client = await Client.findByPk(id);
        console.log(client);
        return res.status(200).send({
            message: 'success',
            data: client
        })
    })
    .catch((err) => {
        return res.status(500);
    });
}

module.exports = {
    getClients,
    addClient,
    getClient,
    editClient
}