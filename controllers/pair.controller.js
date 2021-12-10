'use strict'

const DB = require('../services/db.service');
const Pair = require('../models/pair.model');

// GET all pairs data
async function getPairs (req, res) {
    try {
        const pairs = await Pair.findAll();
        return res.status(200).send({
            message: 'success',
            data: pairs
        });
    } catch (err) {
        return res.status(500).send({
            message: 'Server error'
        });
    }
}

// GET pairs data with names, ticker and urls
async function getPairsName (req, res) {
    try {
        const pairs = await DB.query("SELECT p1.pair_id as id, t1.token_name as tokenA, t1.ticker as tickerA, t1.token_img_url as tokenA_img_url, t2.token_name as tokenB, t2.ticker as tickerB, t2.token_img_url as tokenB_img_url, e1.exchange_name as exchange, e1.exchange_img_url as exchange_img_url FROM pairs p1 INNER JOIN tokens t1 ON t1.token_id = p1.tokenA LEFT JOIN tokens t2 ON t2.token_id = p1.tokenB INNER JOIN exchanges e1 ON e1.exchange_id = p1.pair_exchange;");
        return res.status(200).send({
            message: 'success',
            data: pairs
        });
    } catch (err) {
        return res.status(500).send({
            message: 'Server error'
        });
    }
}

// GET individual pair data
async function getPair (req, res) {
    try {
        const pair = await Pair.findAll({ where: { pair_id: req.params.id } });
        return res.status(200).send({
            message: 'success',
            data: pair
        });
    } catch (err) {
        return res.status(500).send({
            message: 'Server error'
        });
    }
}

// POST Create pair on database
async function addPair (req, res) {
    try {
        const pair = await DB.createPair(req.body.tokenA, req.body.tokenB, req.body.pair_exchange);
        return res.status(200).send({
            message: 'success',
            data: pair
        });
    } catch (err) {
        return res.status(500).send({
            message: 'Server error'
        });
    }
}

// POST modify pair data
async function editPair (req, res) {
    try {
        const pair = await DB.updatePair(req.body.tokenA, req.body.tokenB, req.body.pair_exchange, req.params.id)
        return res.status(200).send({
            message: 'success',
            data: pair
        })
    } catch (err) {
        return res.status(500).send({
            message: 'Server error'
        });
    }
}

module.exports = {
    getPairs,
    getPairsName,
    addPair,
    getPair,
    editPair
}