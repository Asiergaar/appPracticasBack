'use strict'

const DB = require('../services/db.service');
const Pool = require('../models/pool.model');

// GET all pools data
async function getPools (req, res) {
    try {
        const pools = await Pool.findAll();
        return res.status(200).send({
            message: 'success',
            data: pools
        });
    } catch (err) {
        return res.status(500).send({
            message: 'Server error'
        });
    }
}

// GET pools data with name and url
async function getPoolsName (req, res) {
    try {
        const pools = await DB.query("SELECT p1.pool_id, p1.pool_date, p1.invested_quantity, p1.pool_pair, (SELECT t1.token_name as tka FROM pairs pa1 INNER JOIN tokens t1  ON t1.token_id = pa1.tokenA WHERE pa1.pair_id = p1.pool_pair) as tokenA, (SELECT t2.token_img_url FROM pairs pa1 INNER JOIN tokens t2  ON t2.token_id = pa1.tokenA WHERE pa1.pair_id = p1.pool_pair) as tokenA_img_url, pa1.tokenA as tokenA_id, (SELECT t3.token_name as tkb FROM pairs pa2 LEFT JOIN tokens t3 ON t3.token_id = pa2.tokenB WHERE pa2.pair_id = p1.pool_pair) as tokenB, (SELECT t4.token_img_url as tkb FROM pairs pa2 LEFT JOIN tokens t4 ON t4.token_id = pa2.tokenB WHERE pa2.pair_id = p1.pool_pair) as tokenB_img_url, pa1.tokenB as tokenB_id, (SELECT e1.exchange_name as exch FROM pairs pa3 INNER JOIN exchanges e1 ON e1.exchange_id = pa3.pair_exchange WHERE pa3.pair_id = p1.pool_pair) as exchange, pa1.pair_exchange as exchange_id FROM Pools p1 LEFT JOIN pairs pa1 ON pa1.pair_id = p1.pool_pair ORDER BY p1.pool_date DESC;");
        return res.status(200).send({
            message: 'success',
            data: pools
        });
    } catch (err) {
        return res.status(500).send({
            message: 'Server error'
        });
    }
}

// GET array of pools quantity evolution data with name, ticker and url
async function getPoolsData (req, res) {
    try {
        const pairs = await DB.query("SELECT pair_id FROM Pairs;");
        let result = [];
        for(let i = 0; i < pairs.length; i++){
            let id = pairs[i].pair_id;
            const poolData = await DB.query("SELECT date(po.pool_date) as date, po.invested_quantity, po.pool_pair, tk1.token_name as tokenA, tk1.token_img_url as tokenA_img_url, tk2.token_name tokenB, tk2.token_img_url as tokenB_img_url, ex.exchange_name, ex.exchange_img_url as exchange_img_url FROM Pools po INNER JOIN Pairs pa ON po.pool_pair = pa.pair_id INNER JOIN Tokens tk1 ON tk1.token_id = pa.tokenA LEFT JOIN Tokens tk2 ON tk2.token_id = pa.tokenB INNER JOIN Exchanges ex ON ex.exchange_id = pa.pair_exchange WHERE pool_pair = " + id + " ORDER BY date DESC;");
            result.push(poolData);
        }
        return res.status(200).send({
            message: 'success',
            data: result
        });
    } catch (err) {
        return res.status(500).send({
            message: 'Server error'
        });
    }
}

// GET pools distinct
async function getPoolsDistinct (req, res) {
    try {
        const pools = await DB.query("SELECT DISTINCT p1.pool_pair, (SELECT e1.exchange_name FROM pairs pa1 INNER JOIN exchanges e1 ON e1.exchange_id = pa1.pair_exchange WHERE pa1.pair_id = p1.pool_pair) as exchange, (SELECT e2.exchange_img_url FROM pairs pa2 INNER JOIN exchanges e2 ON e2.exchange_id = pa2.pair_exchange WHERE pa2.pair_id = p1.pool_pair) as exchange_img_url, (SELECT t1.token_name FROM pairs pa3 INNER JOIN tokens t1  ON t1.token_id = pa3.tokenA WHERE pa3.pair_id = p1.pool_pair) as tokenA, (SELECT t1.ticker FROM pairs pa3 INNER JOIN tokens t1  ON t1.token_id = pa3.tokenA WHERE pa3.pair_id = p1.pool_pair) as tickerA, (SELECT t1.token_img_url FROM pairs pa4 INNER JOIN tokens t1  ON t1.token_id = pa4.tokenA WHERE pa4.pair_id = p1.pool_pair) as tokenA_img_url, (SELECT t3.token_name FROM pairs pa5 LEFT JOIN tokens t3 ON t3.token_id = pa5.tokenB WHERE pa5.pair_id = p1.pool_pair) as tokenB, (SELECT t3.ticker FROM pairs pa5 LEFT JOIN tokens t3 ON t3.token_id = pa5.tokenB WHERE pa5.pair_id = p1.pool_pair) as tickerB, (SELECT t3.token_img_url FROM pairs pa6 LEFT JOIN tokens t3 ON t3.token_id = pa6.tokenB WHERE pa6.pair_id = p1.pool_pair) as tokenB_img_url, p1.invested_quantity as last_pool, (SELECT max(date(p2.pool_date)) FROM pools p2) as lastdate FROM pools p1 WHERE date(p1.pool_date) = lastdate ORDER BY p1.pool_pair;");
        return res.status(200).send({
            message: 'success',
            data: pools
        });
    } catch (err) {
        return res.status(500).send({
            message: 'Server error'
        });
    }
}

// GET pools status (empty, half or done)
async function getPoolStatus (req, res) {
    try {
        const pools = await DB.query("SELECT p1.pool_pair, p1.invested_quantity, p1.pool_date FROM Pools p1 WHERE date(p1.pool_date) = current_date;");
        const total = await DB.query("SELECT p1.pool_date FROM Pools p1 WHERE date(p1.pool_date) = (SELECT date(min(p2.pool_date)) FROM Pools p2);");
    
        let status = '';
        if(pools === 0 || pools === null || pools === undefined){
            status = 'empty';
        } else if (pools.length != total.length) {
            status = 'half';
        } else {
            status = 'done';
        }
        return res.status(200).send({
            message: 'success',
            status: status,
            data: pools
        });
    } catch (err) {
        return res.status(500).send({
            message: 'Server error'
        });
    }
}

// GET individual pool data
async function getPool (req, res) {
    try {
        const pool = await Pool.findAll({ where: { pool_id: req.params.id } });
        return res.status(200).send({
            message: 'success',
            data: pool
        });
    } catch (err) {
        return res.status(500).send({
            message: 'Server error'
        });
    }
}

// POST create all pools on database
async function addPools (req, res) {
    try {
        let pool;
        let poolDate = Date();
        let pools = req.body;
        for (let p in pools) {
            // Creates the pool with the invested quantity
            pool = await DB.createPool(poolDate, pools[p], parseInt(p));
        }
        return res.status(200).send({
            message: 'success',
            data: pool
        });
    } catch (err) {
        return res.status(500).send({
            message: 'Server error'
        });
    }
}

// POST create one pool on database
async function addPool (req, res) {
    try {
        const progresses = await DB.query("SELECT progress_date FROM Progresses ORDER BY progress_date;");
        const pool_date = new Date();
        const last_date = new Date(progresses[progresses.length - 1].progress_date);
        let pool;
        
        // If first pool, creates first progress
        if (progresses.length === 0) {
            await DB.createProgress(pool_date, 0); 
        }
        // if previous progress existing, adds pools of those days at 0 
        else if (progresses.length > 1) {
            for (let p in progresses) {
                pool = await DB.createPool(progresses[p].progress_date, 0.00, req.body.pool_pair);
            }
    
            // if today's pools done
            if (pool_date.toISOString().split('T')[0] === last_date.toISOString().split('T')[0]) {
                // Updates the last pool with the invested quantity
                await DB.updatePoolQuantity(req.body.invested_quantity, pool.pool_id);
    
                // update progress 
                const result1 = await DB.query("SELECT date(p1.pool_date) as date, SUM(p1.invested_quantity) as total FROM Pools p1 GROUP BY date ORDER BY date DESC;");
            
                // Get today's and previous total
                const total1 = result1[0].total;
                const total2 = result1[1].total;

                if(total2 === null){ total2 = total1; }
                const benefit = ( ( total1 - total2 ) / total1) * 100;
                const oldbenefit = ( ( (total1 - req.body.invested_quantity) - total2 ) / total1) * 100;

                const result2 = await DB.query("UPDATE Progresses SET progress_percentage = " + benefit + " WHERE date(progress_date) = date('" + pool_date.toISOString().split('T')[0] + "');");
    
                // update capitals
                const capitals = await DB.query("SELECT * FROM Capitals WHERE date(capital_date) = date('" + pool_date.toISOString().split('T')[0] + "');");
                for (let c in capitals) {
                    let newQuantity = capitals[c].capital_quantity * ( (oldbenefit / 100) -1 );
                    newQuantity = newQuantity * -( (benefit / 100) +1 );
                    await DB.updateCapitalQuantity(newQuantity, capitals[c].capital_id);
                }
            } else {
                // Creates the pool with the invested quantity
                const pool = await DB.createPool(pool_date, req.body.invested_quantity, req.body.pool_pair);
            }
        } else {
            // Creates the pool with the invested quantity
            const pool = await DB.createPool(pool_date, req.body.invested_quantity, req.body.pool_pair);
        }
        return res.status(200).send({
            message: 'success',
            data: pool
        });
    } catch (err) {
        return res.status(500).send({
            message: 'Server error'
        });
    }
}

// POST /pool/edit/2
async function editPool (req, res) {
    try {
        const pool = await DB.updatePool(req.body.pool_date, req.body.invested_quantity, req.body.pool_pair, req.params.id);
        return res.status(200).send({
            message: 'success',
            data: pool
        });
    } catch (err) {
        return res.status(500).send({
            message: 'Server error'
        });
    }
}

// GET /poolsByDay
async function getPoolsByDay (req, res) {
    try {
        const pairs = await DB.query("SELECT DISTINCT p1.pool_pair, (SELECT e1.exchange_name as exch FROM pairs pa3 INNER JOIN exchanges e1 ON e1.exchange_id = pa3.pair_exchange WHERE pa3.pair_id = p1.pool_pair) as exchange, (SELECT t1.token_name as tka FROM pairs pa1 INNER JOIN tokens t1  ON t1.token_id = pa1.tokenA WHERE pa1.pair_id = p1.pool_pair) as tokenA, (SELECT t1.ticker as tka FROM pairs pa1 INNER JOIN tokens t1  ON t1.token_id = pa1.tokenA WHERE pa1.pair_id = p1.pool_pair) as tickerA, (SELECT t2.token_name as tkb FROM pairs pa2 LEFT JOIN tokens t2 ON t2.token_id = pa2.tokenB WHERE pa2.pair_id = p1.pool_pair) as tokenB, (SELECT t2.ticker as tkb FROM pairs pa2 LEFT JOIN tokens t2 ON t2.token_id = pa2.tokenB WHERE pa2.pair_id = p1.pool_pair) as tickerB FROM pools p1 ORDER BY p1.pool_pair;");
    
        // Create the query with a for loop
        let sql = "SELECT date(p1.pool_date) as Date, SUM(p1.invested_quantity) as TOTAL";
        for(let data in pairs){
            let pairId = pairs[data].pool_pair;
            let alias = " as '" + pairs[data].exchange + ": " + pairs[data].tickerA + " / " + pairs[data].tickerB + "'";
            sql = sql.concat(", (SELECT p2.invested_quantity FROM Pools p2 WHERE p2.pool_pair = " + pairId + " AND date(p2.pool_date) = date(p1.pool_date))" + alias);
        };
        sql = sql.concat(" , (SELECT sum(nc.newcapital_quantity) FROM Newcapitals nc WHERE date(nc.newcapital_date) = date(p1.pool_date)) as 'NewCapital' FROM Pools p1 GROUP BY date;");
    
        const pools = await DB.query(sql);
    
        let increment = [];
        for(let i = 0; i < pools.length; i++){
            if (i === 0){ 
                pools[i].Increment = 0;
                pools[i].RealIncrement = 0;
                pools[i].Benefit = (pools[i].Increment / pools[i].TOTAL)*100; 
            }
            else { 
                pools[i].Increment = (pools[i].TOTAL - pools[i-1].TOTAL);
                pools[i].RealIncrement = (pools[i].TOTAL - pools[i-1].TOTAL) - pools[i].NewCapital;
                pools[i].Benefit = (pools[i].RealIncrement / pools[i].TOTAL)*100
            }
        }
        return res.status(200).send({
            message: 'success',
            data: pools,
            increment: increment
        });
    } catch (err) {
        return res.status(500).send({
            message: 'Server error'
        });
    }
}


module.exports = {
    getPools,
    getPoolsName,
    getPoolsData,
    getPoolsDistinct,
    getPoolStatus,
    addPool,
    addPools,
    getPool,
    editPool,
    getPoolsByDay
} 