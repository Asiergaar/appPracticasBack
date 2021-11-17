'use strict'

const DB = require('../services/db.service');
const Exchange = require('../models/exchange.model');

// GET all exchanges data
async function getExchanges (req, res) {
    try {
        const exchanges = await Exchange.findAll();
        return res.status(200).send({
            message: 'success',
            data: exchanges
        });
    } catch (err) {
        return res.status(500).send({
            message: 'error',
            data: err
        });
    }
}

// GET individual exchange data
async function getExchange (req, res) {
    try {
        const exchange = await Exchange.findAll({ where: { exchange_id: req.params.id } });
        return res.status(200).send({
            message: 'success',
            data: exchange
        });
    } catch (err) {
        return res.status(500).send({
            message: 'error',
            data: err
        });
    }
}

// POST Create exchange on database
async function addExchange (req, res) {
    try {
        const exchange = await DB.createExchange(req.body.exchange_name, req.body.url, req.body.exchange_img_url);
        return res.status(200).send({
            message: 'success',
            data: exchange
        });
    } catch (err) {
        return res.status(500).send({
            message: 'error',
            data: err
        });
    }
}

// POST modify exchange data
async function editExchange (req, res) {
    try {
        const exchange = await DB.updateExchange(req.body.exchange_name, req.body.url, req.body.exchange_img_url, req.params.id);
        return res.status(200).send({
            message: 'success',
            data: exchange
        })
    } catch (err) {
        return res.status(500).send({
            message: 'error',
            data: err
        });
    }
}

module.exports = {
    getExchanges,
    addExchange,
    getExchange,
    editExchange
}