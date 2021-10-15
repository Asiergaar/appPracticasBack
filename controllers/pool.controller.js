'use strict'

const Pool = require('../models/pool.model');

// GET /pools
async function getPools (req, res) {
    const pools = await Pool.findAll();
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
    const pool = await Pool.create({
        pool_date: req.body.pool_date,
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
    addPool,
    getPool,
    editPool
}