'use strict'

const Pool = require('../models/pool.model');
const { QueryTypes } = require('sequelize');
const sequelize = require('../database');

// GET /pools
async function getPools (req, res) {
    const pools = await Pool.findAll();
    return res.status(200).send({
        message: 'success',
        data: pools
    });
}

// GET /poolsName
async function getPoolsName (req, res) {
    //query without ids
    //const sql = "SELECT p1.pool_id, p1.pool_date, p1.invested_quantity, p1.pool_pair, (SELECT t1.ticker as tka FROM pairs pa1 INNER JOIN tokens t1  ON t1.token_id = pa1.tokenA WHERE pa1.pair_id = p1.pool_pair) as tokenA, (SELECT t2.ticker as tkb FROM pairs pa2 LEFT JOIN tokens t2 ON t2.token_id = pa2.tokenB WHERE pa2.pair_id = p1.pool_pair) as tokenB, (SELECT e1.exchange_name as exch FROM pairs pa3 INNER JOIN exchanges e1 ON e1.exchange_id = pa3.pair_exchange WHERE pa3.pair_id = p1.pool_pair) as exchange FROM Pools p1 ORDER BY p1.pool_id DESC;";
    const sql = "SELECT p1.pool_id, p1.pool_date, p1.invested_quantity, p1.pool_pair, (SELECT t1.token_name as tka FROM pairs pa1 INNER JOIN tokens t1  ON t1.token_id = pa1.tokenA WHERE pa1.pair_id = p1.pool_pair) as tokenA, pa1.tokenA as tokenA_id, (SELECT t2.token_name as tkb FROM pairs pa2 LEFT JOIN tokens t2 ON t2.token_id = pa2.tokenB WHERE pa2.pair_id = p1.pool_pair) as tokenB, pa1.tokenB as tokenB_id, (SELECT e1.exchange_name as exch FROM pairs pa3 INNER JOIN exchanges e1 ON e1.exchange_id = pa3.pair_exchange WHERE pa3.pair_id = p1.pool_pair) as exchange, pa1.pair_exchange as exchange_id FROM Pools p1 LEFT JOIN pairs pa1 ON pa1.pair_id = p1.pool_pair ORDER BY p1.pool_date DESC;";
    const pools = await sequelize.query(sql, { type: QueryTypes.SELECT});
    return res.status(200).send({
        message: 'success',
        data: pools
    });
}

// GET /poolsDistinct
async function getPoolsDistinct (req, res) {
    const sql = "SELECT DISTINCT p1.pool_pair, (SELECT e1.exchange_name as exch FROM pairs pa3 INNER JOIN exchanges e1 ON e1.exchange_id = pa3.pair_exchange WHERE pa3.pair_id = p1.pool_pair) as exchange, (SELECT t1.token_name as tka FROM pairs pa1 INNER JOIN tokens t1  ON t1.token_id = pa1.tokenA WHERE pa1.pair_id = p1.pool_pair) as tokenA, (SELECT t2.token_name as tkb FROM pairs pa2 LEFT JOIN tokens t2 ON t2.token_id = pa2.tokenB WHERE pa2.pair_id = p1.pool_pair) as tokenB FROM pools p1 ORDER BY p1.pool_pair;";
    const pools = await sequelize.query(sql, { type: QueryTypes.SELECT});
    return res.status(200).send({
        message: 'success',
        data: pools
    });
}

// GET /poolsStatus
async function getPoolStatus (req, res) {
    const sql = "SELECT p1.pool_date FROM Pools p1 WHERE date(p1.pool_date) = current_date;";
    const pools = await sequelize.query(sql, { type: QueryTypes.SELECT});
    if(pools == '' || pools == null || pools == undefined){
        return res.status(200).send({
            message: 'success',
            data: 'empty'
        });
    } else {
        return res.status(200).send({
            message: 'success',
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
async function addPool (req, res) {
    var pool_date = Date();
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
    getPoolsDistinct,
    getPoolStatus,
    addPool,
    getPool,
    editPool,
    getPoolsByDay
} 