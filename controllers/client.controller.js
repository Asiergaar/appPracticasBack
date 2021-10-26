'use strict'

const Progress = require('../models/progress.model');
const Capital = require('../models/capital.model');
const Client = require('../models/client.model');
const { QueryTypes } = require('sequelize');
const sequelize = require('../database');

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

    // Create de client on DB
    var entry_date = new Date();
    const client = await Client.create({
        client_name: req.body.client_name,
        client_surname: req.body.client_surname,
        email: req.body.email,
        entry_date: entry_date,
        start_capital: req.body.start_capital
    });

    // Create Progress if doesn't exist that day's progress
    const sql = "SELECT date(p1.progress_date) as date FROM Progresses p1 WHERE date = '" + entry_date.toISOString().split('T')[0] + "';";
    const pooldate = await sequelize.query(sql, { type: QueryTypes.SELECT});
    let id;

    if (pooldate.length == 0){
        // Add first progress and capital to database and get the progress id
        id = await Progress.create({
            progress_date: entry_date,
            progress_percentage: 0
        });
        id = id.progress_id;
    } else {
        // Get the progress id
        const sql = "SELECT p1.progress_id FROM Progresses p1 WHERE date(p1.progress_date) = '" + entry_date.toISOString().split('T')[0] + "';";
        id = await sequelize.query(sql, { type: QueryTypes.SELECT});
        id = id[0].progress_id;
    }
    
    // Create the client's capital for that day
    const capital = await Capital.create({
        capital_client: client.client_id,
        capital_date: entry_date,
        capital_quantity: client.start_capital,
        capital_progress: id
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

// GET /getClientsCapitals
async function getClientsCapitals (req, res) {
    const clientsList = await Client.findAll({attributes: ['client_id']});
    let sql = "SELECT DISTINCT date(c1.capital_date) as Date, p1.progress_percentage as Benefit";
        
    for (let i = 0; i < clientsList.length; i++) {
        let id = clientsList[i].dataValues.client_id;
        sql = sql.concat(", (SELECT c2.capital_quantity FROM Capitals c2 WHERE c2.capital_date = c1.capital_date AND c2.capital_client = " + id + ") as 'Cliente " + id + "' ");
    }

    sql = sql.concat("FROM Capitals c1 INNER JOIN Progresses p1 ON p1.progress_id = c1.capital_progress;");
    const capitals = await sequelize.query(sql, { type: QueryTypes.SELECT});
    return res.status(200).send({
        message: 'success',
        data: capitals
    });
}

module.exports = {
    getClients,
    addClient,
    getClient,
    editClient,
    getClientsCapitals
}