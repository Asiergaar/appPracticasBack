'use strict'

const Progress = require('../models/progress.model');
const Capital = require('../models/capital.model');
const Client = require('../models/client.model');
const { QueryTypes } = require('sequelize');
const sequelize = require('../database');

// GET /clients
async function getClients (req, res) {
    // get client + last capital and date
    const sql = "SELECT cli.client_id, cli.client_name, cli.client_surname, cli.email, cli.entry_date, cli.start_capital, cap.capital_quantity as last_capital, max(cap.capital_date) as last_date, (SELECT sum(nw2.newcapital_quantity) FROM Newcapitals nw2 WHERE nw2.newcapital_client = cli.client_id) as nwcap FROM Clients cli LEFT JOIN Capitals cap ON cli.client_id = cap.capital_client GROUP BY cli.client_id;";
    const clients = await sequelize.query(sql, { type: QueryTypes.SELECT});

    // get total benefit percentage
    const sql2 = "SELECT ((pro.progress_percentage / 100 ) + 1) as progress FROM Progresses pro;";
    const benefits = await sequelize.query(sql2, { type: QueryTypes.SELECT});
    let totalBenefit = 1;
    for(let b in benefits){
        totalBenefit = totalBenefit * benefits[b].progress;
    }
    return res.status(200).send({
        message: 'success',
        data: clients,
        benefit: totalBenefit
    });
}

// GET /client/id
async function getClient (req, res) {
    const id = req.params.id;
    const sql = "SELECT cli.client_id, cli.client_name, cli.client_surname, date(cli.entry_date) as entry_date, cli.email, cli.start_capital, cap.capital_quantity, date(cap.capital_date) as progress_date, pro.progress_percentage FROM Clients cli INNER JOIN Capitals cap ON cli.client_id = cap.capital_client INNER JOIN Progresses pro ON cap.capital_progress = pro.progress_id WHERE cli.client_id = " + id + ";";
    const client = await sequelize.query(sql, { type: QueryTypes.SELECT});
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
    let sql = "SELECT DISTINCT date(c1.capital_date) as Date, p1.progress_percentage as Benefit, sum(c1.capital_quantity) as 'Total', ( ( sum(c1.capital_quantity) ) - ( SELECT sum(po.invested_quantity) FROM Pools po WHERE date(c1.capital_date) = date(po.pool_date) GROUP BY date(po.pool_date) ) ) as Divergencia";
        
    for (let i = 0; i < clientsList.length; i++) {
        let id = clientsList[i].dataValues.client_id;
        sql = sql.concat(", (SELECT c2.capital_quantity FROM Capitals c2 WHERE date(c2.capital_date) = date(c1.capital_date) AND c2.capital_client = " + id + ") as 'Cliente " + id + "', (SELECT sum(nc.newcapital_quantity) FROM Newcapitals nc WHERE date(nc.newcapital_date) = date(c1.capital_date) AND nc.newcapital_client = " + id + ") as 'newcapital" + id + "'"); 
    }

    sql = sql.concat("FROM Capitals c1 INNER JOIN Progresses p1 ON p1.progress_id = c1.capital_progress GROUP BY date(c1.capital_date);");
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