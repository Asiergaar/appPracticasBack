'use strict'

const DB = require('../services/db.service');
const Progress = require('../models/progress.model');
const Pool = require('../models/pool.model');
const Client = require('../models/client.model');
const Capital = require('../models/capital.model');
const NewCapital = require('../models/newcapital.model');


// GET /pool/create
async function addProgress (req, res) {
    try {
        // Get today's and previous total 
        const date = new Date();
        const result1 = await DB.query("SELECT date(p1.pool_date) as date, SUM(p1.invested_quantity) as total FROM Pools p1 GROUP BY date ORDER BY date DESC;");
        const total1 = result1[0].total;
        let total2 = result1[1].total;
        if(total2 === null){
            total2 = total1;
        }
        // Calculate the parameters
        const increment = total1 - total2;
        const result2 = await DB.query("SELECT sum(newcapital_quantity) as newcapital FROM Newcapitals WHERE date(newcapital_date) = date('" + date.toISOString().split('T')[0] + "');");
        const realIncrement = increment - result2[0].newcapital;
        const benefit = (realIncrement / total1) * 100;
        const oldprogress = await DB.query("SELECT progress_id FROM Progresses WHERE date(progress_date) = date('" + date.toISOString().split('T')[0] + "');");
        
        // Create or Update Progress on DB
        let progress;
        if(oldprogress.length === 0) {
            progress = await DB.createProgress(date, benefit);
        } else {
            await DB.updateProgress(date, benefit, oldprogress[0].progress_id);
            progress = await Progress.findOne({
                where:{
                    progress_id: oldprogress[0].progress_id
                }
            })
        }
        return res.status(200).send({
            message: 'success',
            benefit: benefit,
            progress: progress
        });
    } catch (err) {
        return res.status(500).send({
            message: 'Server error'
        });
    }
}

// GET /pool/create
async function checkProgress (req, res) {
    try {          
    // Get the last update's date
    const result1 = await DB.query("SELECT max(date(p1.pool_date)) as date FROM Pools p1;");

    // Get today's and previous date
    const today = new Date().toISOString().split('T')[0] + 'T13:30:42';
    const last = result1[0].date + 'T13:30:42';

    // If not same day, creates missing pools progress and capitals
    if (today != last){
        const date1 = new Date(last);
        const date2 = new Date(today);
        const diffTime = Math.abs(date2 - date1);
        const diffDays = Math.ceil((diffTime / (1000 * 60 * 60 * 24)) - 1);
        for (let i = 1; i <= diffDays; i++) {
            let progressIdList = [];

            // Create missing progress
            let dateNew = new Date(date1);
            dateNew.setDate(date1.getDate() + i);
            let progressId = await DB.createProgress(dateNew, 0);
            progressIdList.push(progressId.progress_id);

            // Create missing pools of the progress
            let dateMinus = new Date(dateNew);
            dateMinus.setDate(dateNew.getDate() - 1);
            const pools = await DB.query("SELECT p1.invested_quantity as invested, p1.pool_pair as pair FROM Pools p1 WHERE date(p1.pool_date) = '" + dateMinus.toISOString().split('T')[0] + "';");
            for (let p in pools) {
                const poo = await DB.createPool(dateNew, pools[p].invested, pools[p].pair);
            }
            // Create missing capitals
            const capitals = await DB.query("SELECT c1.capital_client, c1.capital_quantity, c1.capital_progress FROM Capitals c1 WHERE date(c1.capital_date) = '" + dateMinus.toISOString().split('T')[0] + "';");
            for (let p in capitals) {
                let cont = 0;
                await DB.createCapital(capitals[p].capital_client, dateNew, capitals[p].capital_quantity, progressIdList[cont]);
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
    } catch (err) {
        return res.status(500).send({
            message: 'Server error'
        });
    }
}

// Function to data testing: substract 1 day from database dates (pools, progresses, capitals and newcapitals)
async function minusDate (req, res) {
    try {
        const clients = await Client.findAll();
        for (let p in pools) {
            let date = new Date(clients[p].entry_date);
            date.setDate(date.getDate() - 1)
            clients[p].update({
                entry_date: date
            });
        }
        const pools = await Pool.findAll();
        for (let p in clients) {
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
    } catch (err) {
        return res.status(500).send({
            message: 'Server error'
        });
    }
}


module.exports = {
    addProgress,
    checkProgress,
    minusDate
} 