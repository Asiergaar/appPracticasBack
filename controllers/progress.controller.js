'use strict'

const Progress = require('../models/progress.model');
const Pool = require('../models/pool.model');
const Capital = require('../models/capital.model');
const NewCapital = require('../models/newcapital.model');
const { QueryTypes } = require('sequelize');
const sequelize = require('../database');

// GET /pool/create
async function addProgress (req, res) {
    const date = new Date();
    
    const sql1 = "SELECT date(p1.pool_date) as date, SUM(p1.invested_quantity) as total FROM Pools p1 GROUP BY date ORDER BY date DESC;"
    const result1 = await sequelize.query(sql1, { type: QueryTypes.SELECT});
   
    // Get today's and previous total
    const total1 = result1[0].total;
    const total2 = result1[1].total;


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

// GET /pool/create
async function checkProgress (req, res) {
        
    // Get the last update's date
    const sql1 = "SELECT max(date(p1.pool_date)) as date FROM Pools p1;"
    const result1 = await sequelize.query(sql1, { type: QueryTypes.SELECT});

    // Get today's and previous date
    const today = new Date().toISOString().split('T')[0];
    const last = result1[0].date;

    // If not same day, creates missing pools progress and capitals
    if (today != last){
        const date1 = new Date(last);
        const date2 = new Date(today);
        const diffTime = Math.abs(date2 - date1);
        const diffDays = Math.ceil((diffTime / (1000 * 60 * 60 * 24)) - 1);
        
        for (let i = 1; i <= diffDays; i++) {
            let progressIdList = [];
            // Create missing progress
        let datenew = new Date(date1);
        datenew.setDate(date1.getDate() + i);
            let progressId = await Progress.create({
                progress_date: datenew,
                progress_percentage: 0
            });
            progressIdList.push(progressId.progress_id);
            // Create missing pools of the progress
            let dateminus = new Date(datenew);
            dateminus.setDate(datenew.getDate() - 1);
            const sql2 = "SELECT p1.invested_quantity as invested, p1.pool_pair as pair FROM Pools p1 WHERE date(p1.pool_date) = '" + dateminus.toISOString().split('T')[0] + "';";
            const pools = await sequelize.query(sql2, { type: QueryTypes.SELECT});
            for (let p in pools) {
                const poo = await Pool.create({
                    pool_date: datenew,
                    invested_quantity: pools[p].invested,
                    pool_pair: pools[p].pair
                });
            }
            // Create missing capitals
            const sql3 = "SELECT c1.capital_client, c1.capital_quantity, c1.capital_progress FROM Capitals c1 WHERE date(c1.capital_date) = '" + dateminus.toISOString().split('T')[0] + "';";
            const capitals = await sequelize.query(sql3, { type: QueryTypes.SELECT});
            for (let p in capitals) {
                let cont = 0;
                await Capital.create({
                    capital_client: capitals[p].capital_client,
                    capital_date: datenew,
                    capital_quantity: capitals[p].capital_quantity,
                    capital_progress: progressIdList[cont]
                });
                cont++;
            }

        }
        console.log('Missing pools created');
    } else {
        console.log('not missing pools');
    }


    return res.status(200).send({
        message: 'success'
    });
}

// GET 
async function minusDate (req, res) {
    const pools = await Pool.findAll();
    for (let p in pools) {
        let date = new Date(pools[p].pool_date);
        date.setDate(date.getDate() - 1)
        pools[p].update({
            pool_date: date
        });
    }
    const progress = await Progress.findAll();
    for (let p in progress) {
        let date = new Date(progress[p].progress_date);
        date.setDate(date.getDate() - 1)
        progress[p].update({
            progress_date: date
        });
    }
    const capitals = await Capital.findAll();
    for (let p in capitals) {
        let date = new Date(capitals[p].capital_date);
        date.setDate(date.getDate() - 1)
        capitals[p].update({
            capital_date: date
        });
    }
    const newcapitals = await NewCapital.findAll();
    for (let p in newcapitals) {
        let date = new Date(newcapitals[p].newcapital_date);
        date.setDate(date.getDate() - 1)
        newcapitals[p].update({
            newcapital_date: date
        });
    }


    return res.status(200).send({
        message: 'success'
    });
}


module.exports = {
    addProgress,
    checkProgress,
    minusDate
} 