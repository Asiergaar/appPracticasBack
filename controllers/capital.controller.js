'use strict'

const Capital = require('../models/capital.model');
const NewCapital = require('../models/newcapital.model');
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

// POST /capitals/add
async function newCapital (req, res) {
    
    // Get data and create new capital on database
    const fecha = new Date();
    const quantity = req.body.newcapital_quantity;
    const client = req.body.newcapital_client;

    const newcapital = await NewCapital.create({
        newcapital_date: fecha,
        newcapital_quantity: quantity,
        newcapital_client: client,
    });

    // Get data and update the progress of the date
    const sql1 = "SELECT date(p1.pool_date) as Date, sum(p1.invested_quantity) as TOTAL, (SELECT sum(nc.newcapital_quantity) FROM Newcapitals nc WHERE date(nc.newcapital_date) = date(p1.pool_date)) as newcapitals FROM Pools p1 WHERE date(p1.pool_date) = date('" + fecha.toISOString().split('T')[0] + "') OR date(p1.pool_date) = date('" + fecha.toISOString().split('T')[0] + "', '-1 day') GROUP BY date(p1.pool_date);";
    const totals = await sequelize.query(sql1, { type: QueryTypes.SELECT});

    const increment = totals[1].TOTAL - totals[0].TOTAL;
    const realincrement = increment - quantity;
    const benefit = (realincrement / totals[1].TOTAL)*100;

    const sql2 = "UPDATE Progresses SET progress_percentage = " + benefit + " WHERE date(progress_date) = date('" + fecha.toISOString().split('T')[0] + "');";
    await sequelize.query(sql2, { type: QueryTypes.SELECT});

    //  Get previous capitals and update actual capitals
    const sql3 = "SELECT date(cap.capital_date) as Date, cap.capital_quantity, cap.capital_client FROM Capitals cap WHERE date(cap.capital_date) = date('" + fecha.toISOString().split('T')[0] + "', '-1 day');";
    const capitals = await sequelize.query(sql3, { type: QueryTypes.SELECT});

    for(let p in capitals){
        let newcapital = capitals[p].capital_quantity * ( (benefit / 100) + 1);
        console.log(newcapital);
        if (capitals[p].capital_client == client) {
            newcapital = newcapital + quantity;
        }
        let sql4 = "UPDATE Capitals SET capital_quantity = " + newcapital + " WHERE date(capital_date) = date('" + fecha.toISOString().split('T')[0] + "') AND capital_client = " + capitals[p].capital_client + ";";
        await sequelize.query(sql4, { type: QueryTypes.SELECT});

    }

/*
    // Updates capitals with the new progress
    const sql2 = "UPDATE Capitals SET capital_quantity = capital_quantity + " + quantity + " WHERE '" + fecha.toISOString().split('T')[0] + "' = date(capital_date) AND " + client + " = capital_client;";
    const capital = await sequelize.query(sql2, { type: QueryTypes.SELECT});
*/
    return res.status(200).send({
        message: 'succes',
        data: newcapital,
        mod: 'capital'
    });
}

module.exports = {
    getCapitals,
    addCapitals,
    getCapital,
    newCapital
}