'use strict'

const Capital = require('../models/capital.model');
const { QueryTypes } = require('sequelize');
const sequelize = require('../database');

// GET /capitals
async function getCapitals (req, res) {
    const capitals = await Capital.findAll();
    return res.status(200).send({
        message: 'success',
        data: capitals
    });
}

// GET /capital/id
async function getCapital (req, res) {
    const id = req.params.id;
    const capital = await Capital.findAll({
        where: {
          capital_id: id
        }
    });
    return res.status(200).send({
        message: 'success',
        data: capital
    });
}

// POST /capitals/add
async function addCapitals (req, res) {

    // get the progress info (and date -1 day)
    const progress_id = req.body.progress_id;
    const percent = req.body.progress_percentage;
    const fecha = new Date(req.body.progress_date);
    let dateminus = new Date(req.body.progress_date);
    dateminus.setDate(dateminus.getDate() - 1);

    const sql = "SELECT c1.capital_quantity, c1.capital_client, date(c1.capital_date) FROM Capitals c1 WHERE date(c1.capital_date) = '" + dateminus.toISOString().split('T')[0] + "';";
    const capitalList = await sequelize.query(sql, { type: QueryTypes.SELECT});

    // for all the clients
    for(let n in capitalList) {
        const capital_quantity = capitalList[n].capital_quantity * ( (percent / 100) + 1);
        // Create the capital on DB
        const capital = await Capital.create({
            capital_client: capitalList[n].capital_client,
            capital_date: fecha,
            capital_quantity: capital_quantity,
            capital_progress: progress_id
        });
    }
    

    // Return new capital list
    const sql2 = "SELECT c1.capital_quantity, c1.capital_client, date(c1.capital_date) FROM Capitals c1 WHERE date(c1.capital_date) = '" + fecha.toISOString().split('T')[0] + "';";
    const capitalList2 = await sequelize.query(sql2, { type: QueryTypes.SELECT});

    return res.status(200).send({
        message: 'success',
        data: capitalList2
    });
}

module.exports = {
    getCapitals,
    addCapitals,
    getCapital
}