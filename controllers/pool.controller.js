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
    const sql = "SELECT p1.pool_id, p1.pool_date, p1.invested_quantity, p1.pool_pair, (SELECT t1.ticker as tka FROM pairs pa1 INNER JOIN tokens t1  ON t1.token_id = pa1.tokenA WHERE pa1.pair_id = p1.pool_pair) as tokenA, (SELECT t2.ticker as tkb FROM pairs pa2 LEFT JOIN tokens t2 ON t2.token_id = pa2.tokenB WHERE pa2.pair_id = p1.pool_pair) as tokenB, (SELECT e1.exchange_name as exch FROM pairs pa3 INNER JOIN exchanges e1 ON e1.exchange_id = pa3.pair_exchange WHERE pa3.pair_id = p1.pool_pair) as exchange FROM Pools p1;";
    const pools = await sequelize.query(sql, { type: QueryTypes.SELECT});
    return res.status(200).send({
        message: 'success',
        data: pools
    });
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

module.exports = {
    getPools,
    getPoolsName,
    addPool,
    getPool,
    editPool
} 