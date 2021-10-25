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

// Add missing capitals since las record to parameter date
async function addMissingCapitals (fecha) {
    const sql = "SELECT date(c1.capital_date) as date FROM Capitals c1 GROUP BY date ORDER BY date DESC;";
    const capitalDates = await sequelize.query(sql, { type: QueryTypes.SELECT});

    // get number of days without data
    let date1 = new Date(capitalDates[0].date);
    let date2 = new Date(fecha.toISOString().split('T')[0]);
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil((diffTime / (1000 * 60 * 60 * 24)) - 1);

    if (diffTime > 0){
        // get client list
        const sql2 = "SELECT c1.capital_quantity, c1.capital_client, c1.capital_progress, date(c1.capital_date) FROM Capitals c1 WHERE date(c1.capital_date) = '" + date1.toISOString().split('T')[0] + "';";
        const clientCapital = await sequelize.query(sql2, { type: QueryTypes.SELECT});

        //add capitals for each progress
        for (let i = 1; i <= diffDays; i++) {
            let datenew = new Date();
            datenew.setDate(date1.getDate() + i);
            for (let j = 0; j < clientCapital.length; j++){
                const sql3 = "SELECT progress_id as id FROM Progresses p1 WHERE date(p1.progress_date) = '" + datenew.toISOString().split('T')[0] + "';";
                const progress = await sequelize.query(sql3, { type: QueryTypes.SELECT});
                let progressnew = progress[0].id;
                let capitalnew = Number.parseFloat(clientCapital[j].capital_quantity);
                await Capital.create({
                    capital_client: clientCapital[j].capital_client,
                    capital_date: datenew,
                    capital_quantity: capitalnew,
                    capital_progress: progressnew
                });
            }
        }
    }
}

// POST /capitals/add
async function addCapitals (req, res) {

    // get the progress info (and date -1 day)
    const progress_id = req.body.progress_id;
    const percent = req.body.progress_percentage;
    const fecha = new Date(req.body.progress_date);
    let dateminus = new Date(req.body.progress_date);
    dateminus.setDate(dateminus.getDate() - 1);

    await addMissingCapitals(fecha);

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
    getCapital,
    addMissingCapitals
}