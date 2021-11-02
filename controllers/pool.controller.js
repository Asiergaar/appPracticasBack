'use strict'

const Pool = require('../models/pool.model');
const Progress = require('../models/progress.model');
const { QueryTypes } = require('sequelize');
const sequelize = require('../database');

// GET /pools
async function getPools (req, res) {
    const pools = await Pool.findAll();
    return res.status(200).send({
        message: 'success',
        data: pools,
        pro: progresses
    });
}

// GET /poolsName
async function getPoolsName (req, res) {
    const sql = "SELECT p1.pool_id, p1.pool_date, p1.invested_quantity, p1.pool_pair, (SELECT t1.token_name as tka FROM pairs pa1 INNER JOIN tokens t1  ON t1.token_id = pa1.tokenA WHERE pa1.pair_id = p1.pool_pair) as tokenA, (SELECT t2.token_img_url FROM pairs pa1 INNER JOIN tokens t2  ON t2.token_id = pa1.tokenA WHERE pa1.pair_id = p1.pool_pair) as tokenA_img_url, pa1.tokenA as tokenA_id, (SELECT t3.token_name as tkb FROM pairs pa2 LEFT JOIN tokens t3 ON t3.token_id = pa2.tokenB WHERE pa2.pair_id = p1.pool_pair) as tokenB, (SELECT t4.token_img_url as tkb FROM pairs pa2 LEFT JOIN tokens t4 ON t4.token_id = pa2.tokenB WHERE pa2.pair_id = p1.pool_pair) as tokenB_img_url, pa1.tokenB as tokenB_id, (SELECT e1.exchange_name as exch FROM pairs pa3 INNER JOIN exchanges e1 ON e1.exchange_id = pa3.pair_exchange WHERE pa3.pair_id = p1.pool_pair) as exchange, pa1.pair_exchange as exchange_id FROM Pools p1 LEFT JOIN pairs pa1 ON pa1.pair_id = p1.pool_pair ORDER BY p1.pool_date DESC;";
    const pools = await sequelize.query(sql, { type: QueryTypes.SELECT});
    return res.status(200).send({
        message: 'success',
        data: pools
    });
}

// GET /poolsData
async function getPoolsData (req, res) {
    const sql = "SELECT pair_id FROM Pairs;";
    const pairs = await sequelize.query(sql, { type: QueryTypes.SELECT});
    let result = [];
    for(let i = 0; i < pairs.length; i++){
        let id = pairs[i].pair_id;
        const sql2 = "SELECT date(po.pool_date) as date, po.invested_quantity, po.pool_pair, tk1.token_name as tokenA, tk1.token_img_url as tokenA_img_url, tk2.token_name tokenB, tk2.token_img_url as tokenB_img_url, ex.exchange_name, ex.exchange_img_url as exchange_img_url FROM Pools po INNER JOIN Pairs pa ON po.pool_pair = pa.pair_id INNER JOIN Tokens tk1 ON tk1.token_id = pa.tokenA LEFT JOIN Tokens tk2 ON tk2.token_id = pa.tokenB INNER JOIN Exchanges ex ON ex.exchange_id = pa.pair_exchange WHERE pool_pair = " + id + " ORDER BY date DESC;";
        const poolData = await sequelize.query(sql2, { type: QueryTypes.SELECT});
        result.push(poolData);
    }
    return res.status(200).send({
        message: 'success',
        data: result
    });
}

// GET /poolsDistinct
async function getPoolsDistinct (req, res) {
    const sql = "SELECT DISTINCT p1.pool_pair, (SELECT e1.exchange_name FROM pairs pa1 INNER JOIN exchanges e1 ON e1.exchange_id = pa1.pair_exchange WHERE pa1.pair_id = p1.pool_pair) as exchange, (SELECT e2.exchange_img_url FROM pairs pa2 INNER JOIN exchanges e2 ON e2.exchange_id = pa2.pair_exchange WHERE pa2.pair_id = p1.pool_pair) as exchange_img_url, (SELECT t1.token_name FROM pairs pa3 INNER JOIN tokens t1  ON t1.token_id = pa3.tokenA WHERE pa3.pair_id = p1.pool_pair) as tokenA, (SELECT t1.token_img_url FROM pairs pa4 INNER JOIN tokens t1  ON t1.token_id = pa4.tokenA WHERE pa4.pair_id = p1.pool_pair) as tokenA_img_url, (SELECT t3.token_name FROM pairs pa5 LEFT JOIN tokens t3 ON t3.token_id = pa5.tokenB WHERE pa5.pair_id = p1.pool_pair) as tokenB , (SELECT t3.token_img_url FROM pairs pa6 LEFT JOIN tokens t3 ON t3.token_id = pa6.tokenB WHERE pa6.pair_id = p1.pool_pair) as tokenB_img_url FROM pools p1 ORDER BY p1.pool_pair;";
    const pools = await sequelize.query(sql, { type: QueryTypes.SELECT});
    return res.status(200).send({
        message: 'success',
        data: pools
    });
}

// GET /poolsStatus
async function getPoolStatus (req, res) {
    const sql = "SELECT p1.pool_pair, p1.invested_quantity, p1.pool_date as num FROM Pools p1 WHERE date(p1.pool_date) = current_date;";
    const pools = await sequelize.query(sql, { type: QueryTypes.SELECT});
    const sql2 = "SELECT p1.pool_date as num FROM Pools p1 WHERE date(p1.pool_date) = (SELECT date(min(p2.pool_date)) FROM Pools p2);";
    const total = await sequelize.query(sql2, { type: QueryTypes.SELECT});

    if(pools == 0 || pools == null || pools == undefined){
        return res.status(200).send({
            message: 'success',
            data: 'empty'
        });
    } else if (pools.length != total.length) {
        return res.status(200).send({
            message: 'success',
            status: 'half',
            data: pools
        });
    } else {
        return res.status(200).send({
            message: 'success',
            status: 'done',
            data: pools
        });
    }
}

// GET /pool/id
async function getPool (req, res) {
    const id = req.params.id;
    const pool = await Pool.findAll({
        where: {
          pool_id: id
        }
    });
    return res.status(200).send({
        message: 'success',
        data: pool
    });
}

// POST /pool/create
async function addPools (req, res) {
    var pool_date = Date();

    // Creates the pool with the invested quantity
    const pool = await Pool.create({
        pool_date: pool_date,
        invested_quantity: req.body.invested_quantity,
        pool_pair: req.body.pool_pair
    });
    return res.status(200).send({
        message: 'success',
        data: pool
    });
}

// POST /pool/create
async function addPool (req, res) {
    var pool_date = Date();

    // If first pool, creates first progress
    const sql = "SELECT progress_date FROM Progresses ORDER BY progress_date;";
    const progresses = await sequelize.query(sql, { type: QueryTypes.SELECT});
    
    if (progresses.length == 0) {
        await Progress.create({
            progress_date: pool_date,
            progress_percentage: 0
        });
    }
    
    // if previous progress existing, adds pools of those days at 0 
    else if (progresses.length > 0) {
        for (let p in progresses) {
            await Pool.create({
                pool_date: progresses[p].progress_date,
                invested_quantity: 0,
                pool_pair: req.body.pool_pair
            });
        }
    }

    // Creates the pool with the invested quantity
    const pool = await Pool.create({
        pool_date: pool_date,
        invested_quantity: req.body.invested_quantity,
        pool_pair: req.body.pool_pair
    });
    return res.status(200).send({
        message: 'success',
        data: pool
    });
}

// POST /pool/edit/2
async function editPool (req, res) {
    const id = req.params.id;
    const pool = await Pool.update({ 
        pool_date: req.body.pool_date,
        invested_quantity: req.body.invested_quantity,
        pool_pair: req.body.pool_pair }, {
        where: {
            pool_id: id
        }
    })
    .then(async (result) => {
        const pool = await Pool.findByPk(id);
        console.log(pool);
        return res.status(200).send({
            message: 'success',
            data: pool
        })
    })
    .catch((err) => {
        return res.status(500);
    });
}

// GET /poolsByDay
async function getPoolsByDay (req, res) {
    const sqlpairs = "SELECT DISTINCT p1.pool_pair, (SELECT e1.exchange_name as exch FROM pairs pa3 INNER JOIN exchanges e1 ON e1.exchange_id = pa3.pair_exchange WHERE pa3.pair_id = p1.pool_pair) as exchange, (SELECT t1.token_name as tka FROM pairs pa1 INNER JOIN tokens t1  ON t1.token_id = pa1.tokenA WHERE pa1.pair_id = p1.pool_pair) as tokenA, (SELECT t2.token_name as tkb FROM pairs pa2 LEFT JOIN tokens t2 ON t2.token_id = pa2.tokenB WHERE pa2.pair_id = p1.pool_pair) as tokenB FROM pools p1 ORDER BY p1.pool_pair;";
    const pairs = await sequelize.query(sqlpairs, { type: QueryTypes.SELECT});

    // Create the query with a for loop
    let sql = "SELECT date(p1.pool_date) as Date, SUM(p1.invested_quantity) as TOTAL";
    for(let data in pairs){
        let pairId = pairs[data].pool_pair;
        let alias = " as '" + pairs[data].exchange + ": " + pairs[data].tokenA + " / " + pairs[data].tokenB + "'";
        sql = sql.concat(", (SELECT p2.invested_quantity FROM Pools p2 WHERE p2.pool_pair = " + pairId + " AND date(p2.pool_date) = date(p1.pool_date))" + alias);
    };
    sql = sql.concat(" FROM Pools p1 GROUP BY date;");

    const pools = await sequelize.query(sql, { type: QueryTypes.SELECT});

    let increment = [];
    for(let i = 0; i < pools.length; i++){
        if (i == 0){ 
            pools[i].Increment = 0;
            pools[i].Benefit = (pools[i].Increment / pools[i].TOTAL)*100; 
        }
        else { 
            pools[i].Increment = (pools[i].TOTAL - pools[i-1].TOTAL);
            pools[i].Benefit = (pools[i].Increment / pools[i].TOTAL)*100
        }
    }
    return res.status(200).send({
        message: 'success',
        data: pools,
        increment: increment
    });
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