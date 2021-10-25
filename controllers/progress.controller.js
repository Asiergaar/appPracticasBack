'use strict'

const Progress = require('../models/progress.model');
const Pool = require('../models/pool.model');
const { QueryTypes } = require('sequelize');
const sequelize = require('../database');

// POST /pool/create
async function addProgress (req, res) {
    const date = new Date();
    
    const sql1 = "SELECT date(p1.pool_date) as date, SUM(p1.invested_quantity) as total FROM Pools p1 GROUP BY date ORDER BY date DESC;"
    const result1 = await sequelize.query(sql1, { type: QueryTypes.SELECT});
   
    // Get today's and previous total
    const total1 = result1[0].total;
    const total2 = result1[1].total;

    // If neccesary, get the missing pools updates to generate with 0%
    let previous = new Date(result1[0].date);
    previous.setDate(previous.getDate() - 1);
    if(result1[1].date != previous.toISOString().split('T')[0]){
        const date1 = new Date(result1[1].date);
        const date2 = new Date(result1[0].date);
        const diffTime = Math.abs(date2 - date1);
        const diffDays = Math.ceil((diffTime / (1000 * 60 * 60 * 24)) - 1);

        for (let i = 1; i <= diffDays; i++) {
            // Create missing progress
            let datenew = new Date();
            datenew.setDate(date1.getDate() + i);
            await Progress.create({
                progress_date: datenew,
                progress_percentage: 0
            });
            // Create missing pools of the progress
            let dateminus = new Date();
            dateminus.setDate(datenew.getDate() - 1);
            const sql2 = "SELECT p1.invested_quantity as invested, p1.pool_pair as pair FROM Pools p1 WHERE date(p1.pool_date) = '" + dateminus.toISOString().split('T')[0] + "';";
            const pools = await sequelize.query(sql2, { type: QueryTypes.SELECT});
            for (let p in pools) {
                await Pool.create({
                    pool_date: datenew,
                    invested_quantity: pools[p].invested,
                    pool_pair: pools[p].pair
                });
            }
        }
    }


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
        progress: progress
    });
}


module.exports = {
    addProgress
} 