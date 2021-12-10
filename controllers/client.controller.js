'use strict'

const DB = require('../services/db.service');
const Utils = require('../services/utils.service');
const Client = require('../models/client.model');
const nodemailer = require('../node_modules/nodemailer');
const converter = require('../node_modules/json-2-csv');


// GET clients data and last capital
async function getClients (req, res) {
    try {
        // get client + last capital and date
        const clients = await DB.query("SELECT cli.client_id, cli.client_name, cli.client_surname, cli.email, cli.entry_date, CASE WHEN date(cli.entry_date) <= (SELECT date(min(entry_date)) FROM Clients) THEN true ELSE false END isInitial, cli.start_capital, cap.capital_quantity as last_capital, max(cap.capital_date) as last_date, (SELECT sum(nw2.newcapital_quantity) FROM Newcapitals nw2 WHERE nw2.newcapital_client = cli.client_id) as nwcap FROM Clients cli LEFT JOIN Capitals cap ON cli.client_id = cap.capital_client GROUP BY cli.client_id;");
    
        // get total benefit percentage
        const benefits = await DB.query("SELECT ((pro.progress_percentage / 100 ) + 1) as progress FROM Progresses pro;");
        let totalBenefit = 1;
        for(let b in benefits){ totalBenefit = totalBenefit * benefits[b].progress; }
        
        return res.status(200).send({
            message: 'success',
            data: clients,
            benefit: totalBenefit
        });
    } catch (err) {
        return res.status(500).send({
            message: 'Server error'
        });
    }
}

// GET individual client data with al progresses and capital modifications
async function getClient (req, res) {
    try {
        const id = req.params.id;
        const client = await DB.query("SELECT cli.client_id, cli.client_name, cli.client_surname, date(cli.entry_date) as entry_date, cli.email, cli.start_capital, cap.capital_quantity, date(cap.capital_date) as progress_date, pro.progress_percentage, ifnull((SELECT sum(nwc.newcapital_quantity) FROM Newcapitals nwc WHERE nwc.newcapital_client = " + id + "), 0) as NewCapitalTotal, ifnull(nwc.newcapital_quantity, 0) as NewCapital, date(nwc.newcapital_date) as NewCapitalDate FROM Clients cli INNER JOIN Capitals cap ON cli.client_id = cap.capital_client INNER JOIN Progresses pro ON cap.capital_progress = pro.progress_id LEFT JOIN Newcapitals nwc ON nwc.newcapital_client = cli.client_id AND date(nwc.newcapital_date) = date(pro.progress_date) WHERE cli.client_id = " + id + ";");
        return res.status(200).send({
            message: 'success',
            data: client
        });
    } catch (err) {
        return res.status(500).send({
            message: 'Server error'
        });
    }
}

// POST create client (with progress and capital)
async function addClient (req, res) {
    try {
        // Create de client on DB
        let entryDate = new Date();
        const client = await DB.createClient(req.body.client_name, req.body.client_surname, req.body.email, entryDate, req.body.start_capital);
    
        // Create Progress if doesn't exist that day's progress
        const pooldate = await DB.query("SELECT date(p1.progress_date) as date FROM Progresses p1 WHERE date = '" + entryDate.toISOString().split('T')[0] + "';");
        let id;
        if (pooldate.length === 0){
            // Add first progress and capital to database and get the progress id
            id = await DB.createProgress(entryDate, 0);
            id = id.progress_id;
        } else {
            // Get the progress id
            id = await DB.query("SELECT p1.progress_id FROM Progresses p1 WHERE date(p1.progress_date) = '" + entryDate.toISOString().split('T')[0] + "';");
            id = id[0].progress_id;
        }
        
        // Create the client's capital for that day
        const capital = await DB.createCapital(client.client_id, entryDate, client.start_capital, id);
        
        return res.status(200).send({
            message: 'success',
            data: client
        });
    } catch (err) {
        return res.status(500).send({
            message: 'Server error'
        });
    }
}

// POST edit client data
async function editClient (req, res) {
    try {
        const client = await DB.updateClient(req.body.client_name, req.body.client_surname, req.body.email, req.params.id);
        return res.status(200).send({
            message: 'success',
            data: client
        })
    } catch (err) {
        return res.status(500).send({
            message: 'Server error'
        });
    }
}

// GET Array of all clients capitals (and newcapitals) by day
async function getClientsCapitals (req, res) {
    try {
        // Create query with subquery for every client
        const clientsList = await Client.findAll({attributes: ['client_id']});

        // If no clients on database, return empty array
        if (clientsList.length === 0) {
            return res.status(200).send({
                message: 'no data',
                data: []
            });
        }

        let sql = "SELECT DISTINCT date(c1.capital_date) as Date, p1.progress_percentage as Benefit, sum(c1.capital_quantity) as 'Total', ( ( sum(c1.capital_quantity) ) - ( SELECT sum(po.invested_quantity) FROM Pools po WHERE date(c1.capital_date) = date(po.pool_date) GROUP BY date(po.pool_date) ) ) as Divergence";
        for (let i = 0; i < clientsList.length; i++) {
            let id = clientsList[i].dataValues.client_id;
            sql = sql.concat(", (SELECT c2.capital_quantity FROM Capitals c2 WHERE date(c2.capital_date) = date(c1.capital_date) AND c2.capital_client = " + id + ") as 'Cliente " + id + "', (SELECT sum(nc.newcapital_quantity) FROM Newcapitals nc WHERE date(nc.newcapital_date) = date(c1.capital_date) AND nc.newcapital_client = " + id + ") as 'newcapital" + id + "'"); 
        }
        sql = sql.concat("FROM Capitals c1 INNER JOIN Progresses p1 ON p1.progress_id = c1.capital_progress GROUP BY date(c1.capital_date);");

        const capitals = await DB.query(sql);

        return res.status(200).send({
            message: 'success',
            data: capitals
        });
    } catch (err) {
        return res.status(500).send({
            message: 'Server error'
        });
    }
}

// GET clients monthly data
async function getClientMonthlyData (req, res) {
    try{
        let result = [];
        let resultCsv = [];
        const clients = await Client.findAll();
        for (let cli in clients){
            const id = clients[cli].client_id;
            // Get info of the client
            let capitals = await DB.query("SELECT cli.client_id, cli.client_name, cli.client_surname, cli.email, date(cli.entry_date) as Entry, cli.start_capital, date(cap.capital_date) as ActualMonth, cap.capital_quantity as ActualCapital, 0 as BenefitPercentage, (cap.capital_quantity - ifnull((SELECT cap2.capital_quantity FROM Capitals cap2 WHERE date(cap2.capital_date) = date(cap.capital_date, '-1 month') AND capital_client = " + id + "), cli.start_capital)) Benefit, date(cap.capital_date, '-1 month') as LastMonth, ifnull((SELECT cap2.capital_quantity FROM Capitals cap2 WHERE date(cap2.capital_date) = date(cap.capital_date, '-1 month') AND capital_client = " + id + "), cli.start_capital) as LastMonthCapital, ifnull(sum(nwc.newcapital_quantity),0) as NewCapital, count(date(nwc.newcapital_date)) as CountNewCapitalDate, date(nwc.newcapital_date) as NewCapitalDate FROM Capitals cap INNER JOIN Clients cli ON cli.client_id = cap.capital_client LEFT JOIN Newcapitals nwc ON nwc.newcapital_client = cap.capital_client AND strftime('%m', nwc.newcapital_date, '+1 month') = strftime('%m', cap.capital_date) WHERE ((strftime('%m', ActualMonth) != strftime('%m', ActualMonth, '-1 day') AND strftime('%Y', ActualMonth) = strftime('%Y', 'now')) OR ActualMonth = date(cli.entry_date)) AND capital_client = " + id + " GROUP BY ActualMonth ORDER BY ActualMonth DESC LIMIT 1;");

            // Get progress
            const progress = await DB.query("SELECT ((pro.progress_percentage / 100 ) + 1) as progress FROM Progresses pro WHERE date(progress_date) > date('" + capitals[0].LastMonth + "') AND date(progress_date) <= date('" + capitals[0].ActualMonth + "');");
            let benefit = 1;
            for (let p in progress) { benefit = benefit * progress[p].progress; }
            capitals[0].BenefitPercentage = benefit;
            
            // Add complete result to array
            result.push({ id: id, capitals });

            // convert json to csv
            try {
                let csv = await Utils.jsonToCsv(capitals);
                resultCsv.push({id: id, data: csv});
            } catch (err) {
                console.log(err);
            }

        }
        return res.status(200).send({
            message: 'success',
            data: result,
            csv: resultCsv
        });

    } catch (err) {
        return res.status(500).send({
            message: 'Server error'
        });
    }
}

module.exports = {
    getClients,
    addClient,
    getClient,
    editClient,
    getClientsCapitals,
    getClientMonthlyData
}