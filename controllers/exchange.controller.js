'use strict'

const Exchange = require('../models/exchange.model');

// GET /Exchanges
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

// GET /Exchange/id
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

// POST /exchange/create
async function addExchange (req, res) {
    try {
        const exchange = await DB.create(req.body.exchange_name, req.body.url, req.body.exchange_img_url);
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

// POST /exchange/edit/2
async function editExchange (req, res) {
    try {
        const id = req.params.id;
        const exchange = await Exchange.update({ 
            exchange_name: req.body.exchange_name,
            URL: req.body.url,
            exchange_img_url: req.body.exchange_img_url }, {
            where: {
                exchange_id: id
            }
        })
        .then(async (result) => {
            const exchange = await Exchange.findByPk(id);
            console.log(exchange);
            return res.status(200).send({
                message: 'success',
                data: exchange
            })
        })
        .catch((err) => {
            return res.status(500);
        });
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