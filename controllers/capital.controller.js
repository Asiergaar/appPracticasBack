'use strict'

const DB = require('../services/db.service');
const Capital = require('../models/capital.model');

// GET capitals data
async function getCapitals (req, res) {
    try {
        const capitals = await Capital.findAll();
        return res.status(200).send({
            message: 'success',
            data: capitals
        });
    } catch (err) {
        return res.status(500).send({
            message: 'error',
            data: err
        });
    }
}

// GET individual capital data
async function getCapital (req, res) {
    try {
        const id = req.params.id;
        const capital = await Capital.findAll({ where: { capital_id: id } });
        return res.status(200).send({
            message: 'success',
            data: capital
        });
    } catch (err) {
        return res.status(500).send({
            message: 'error',
            data: err
        });
    }
}

// POST add all clients capitals to database
async function addCapitals (req, res) {
    try {
        // get the progress date and date -1 day
        const fecha = new Date(req.body.progress_date);
        let dateminus = new Date(req.body.progress_date);
        dateminus.setDate(dateminus.getDate() - 1);
    
        // gets yesterday capitals
        const capitalList = await DB.query("SELECT c1.capital_quantity, c1.capital_client, date(c1.capital_date) FROM Capitals c1 WHERE date(c1.capital_date) = date('" + dateminus.toISOString().split('T')[0] + "');");
    
        // get new clients of the date
        const newclients = await DB.query("SELECT client_id FROM Clients WHERE date(entry_date) = date('" + fecha.toISOString().split('T')[0] + "');");
        
        // crete new capital for all the clients except the new ones
        for(let n in capitalList) {
            if(!newclients.includes(capitalList[n].capital_client)) {
                const capital_quantity = capitalList[n].capital_quantity * ( (req.body.progress_percentage / 100) + 1);
                const capital = await DB.createCapital(capitalList[n].capital_client, fecha, capital_quantity, req.body.progress_id);
            }
        }
        
        // Return new capitals list
        const capitalList2 = await DB.query("SELECT c1.capital_quantity, c1.capital_client, date(c1.capital_date) FROM Capitals c1 WHERE date(c1.capital_date) = '" + fecha.toISOString().split('T')[0] + "';");
    
        return res.status(200).send({
            message: 'success',
            data: capitalList2
        });
    } catch (err) {
        return res.status(500).send({
            message: 'error',
            data: err
        });
    }
}

// POST modify capital
async function setCapital (req, res) {
    try {
        await DB.query("UPDATE Capitals SET capital_quantity = " + req.body.capital_quantity + " WHERE capital_client = " + req.body.capital_client + ";");
    } catch (err) {
        return res.status(500).send({
            message: 'error',
            data: err
        });
    }
}

// POST add one capital to database
async function newCapital (req, res) {
    try {
        // Get data and create new capital on database
        const fecha = new Date();
        const quantity = req.body.newcapital_quantity;
        const client = req.body.newcapital_client;
    
        const newcapital = await DB.createNewCapital(fecha, quantity, client,);
    
        // Get data and update the progress of the date
        const totals = await DB.query("SELECT date(p1.pool_date) as Date, sum(p1.invested_quantity) as TOTAL, (SELECT sum(nc.newcapital_quantity) FROM Newcapitals nc WHERE date(nc.newcapital_date) = date(p1.pool_date)) as newcapitals FROM Pools p1 WHERE date(p1.pool_date) = date('" + fecha.toISOString().split('T')[0] + "') OR date(p1.pool_date) = date('" + fecha.toISOString().split('T')[0] + "', '-1 day') GROUP BY date(p1.pool_date);");
    
        if (totals.length > 1) {
            const increment = totals[1].TOTAL - totals[0].TOTAL;
            const realincrement = increment - quantity;
            const benefit = (realincrement / totals[1].TOTAL)*100;
    
            await DB.query("UPDATE Progresses SET progress_percentage = " + benefit + " WHERE date(progress_date) = date('" + fecha.toISOString().split('T')[0] + "');");
    
            //  Get previous capitals and update actual capitals
            const capitals = await DB.query("SELECT date(cap.capital_date) as Date, cap.capital_quantity, cap.capital_client FROM Capitals cap WHERE date(cap.capital_date) = date('" + fecha.toISOString().split('T')[0] + "', '-1 day');");
    
            for(let p in capitals){
                let newcapital = capitals[p].capital_quantity * ( (benefit / 100) + 1);
                if (capitals[p].capital_client == client) { newcapital = newcapital + quantity; }
                await DB.query("UPDATE Capitals SET capital_quantity = " + newcapital + " WHERE date(capital_date) = date('" + fecha.toISOString().split('T')[0] + "') AND capital_client = " + capitals[p].capital_client + ";");
            }
        }
    
        return res.status(200).send({
            message: 'succes',
            data: newcapital,
            mod: 'capital'
        });
    } catch (err) {
        return res.status(500).send({
            message: 'error',
            data: err
        });
    }
}

// GET month capitals total
async function getMonthTotals (req, res) {
    try {
        const totals = await DB.query("SELECT date(capital_date) as Date, sum(capital_quantity) as Total FROM Capitals WHERE strftime('%m', capital_date) != strftime('%m', capital_date, '+1 day') AND strftime('%Y', capital_date) = strftime('%Y', 'now') GROUP BY date(capital_date) ORDER BY date(capital_date) DESC;");
        return res.status(200).send({
            message: 'succes',
            data: totals
        });
    } catch (err) {
        return res.status(500).send({
            message: 'error',
            data: err
        });
    }
}

module.exports = {
    getCapitals,
    addCapitals,
    getCapital,
    setCapital,
    newCapital,
    getMonthTotals
}