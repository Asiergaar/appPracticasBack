'use strict'

const Progress = require('../models/progress.model');
const { QueryTypes } = require('sequelize');
const sequelize = require('../database');

// POST /pool/create
async function addProgress (req, res) {
    let date = new Date();
    var dateminus = new Date();
    dateminus.setDate(date.getDate() - 1);

    console.log(date.toISOString().split('T')[0]);
    console.log(dateminus.toISOString().split('T')[0]);
    
    // Get today's total
    const sql1 = "SELECT date(p1.pool_date) as date, SUM(p1.invested_quantity) as total FROM Pools p1 WHERE date = '" + date.toISOString().split('T')[0] + "';";
    const result1 = await sequelize.query(sql1, { type: QueryTypes.SELECT});
    let total1 = result1[0].total;

    // Get yesterday's total
    const sql2 = "SELECT date(p1.pool_date) as date, SUM(p1.invested_quantity) as total FROM Pools p1 WHERE date = '" + dateminus.toISOString().split('T')[0] + "';";
    const result2 = await sequelize.query(sql2, { type: QueryTypes.SELECT});
    let total2 = result2[0].total;

    if(total2 == null){
        total2 = total1;
    }
    const capitalNew = 0;
    const increment = total1 - total2;
    const realIncrement = increment - capitalNew;
    const benefit = (realIncrement / total1) * 100;

    // Create Progress on DB
    const progress = await Progress.create({
        progress_date: date,
        progress_percentage: benefit

    });

    return res.status(200).send({
        message: 'success',
        benefit: benefit,
        progreso: progress
    });
}


module.exports = {
    addProgress
} 