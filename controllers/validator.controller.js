'use strict'

const sequelize = require('../database');
const { Op } = require('sequelize');
const Client = require('../models/client.model');
const Exchange = require('../models/exchange.model');
const Token = require('../models/token.model');
const Pair = require('../models/pair.model');

// POST /validator/checkclient
async function checkClient (req, res) {
    try {
        const client = await Client.findOne({ 
            where: { 
                client_name: req.body.client_name, 
                client_surname: req.body.client_surname, 
                email: req.body.email 
            } 
        });
        return res.status(200).send({
            message: 'succes',
            data: client
        });
    } catch (err) {
        return res.status(500).send({
            message: 'error',
            data: err.message
        });
    }
}

// POST /validator/checkexchange
async function checkExchange (req, res) {
    try {
        const exchange = await Exchange.findOne({ 
            where: sequelize.where(sequelize.fn('lower', sequelize.col('exchange_name')), req.body.exchange_name.toLowerCase())
        });
        return res.status(200).send({
            message: 'succes',
            data: exchange
        });
    } catch (err) {
        return res.status(500).send({
            message: 'error',
            data: err.message
        });
    }
}

// POST /validator/checktoken
async function checkToken (req, res) {
    try {
        const token = await Token.findOne({  
            where: { 
                [Op.or]: [
                    sequelize.where(sequelize.fn('lower', sequelize.col('token_name')), req.body.token_name.toLowerCase()),
                    sequelize.where(sequelize.fn('upper', sequelize.col('ticker')), req.body.ticker.toUpperCase())
                ]  
            } 
        });
        return res.status(200).send({
            message: 'succes',
            data: token
        });
    } catch (err) {
        return res.status(500).send({
            message: 'error',
            data: err.message
        });
    }
}

// POST /validator/checktoken
async function checkPair (req, res) {
    try {
        const pair1 = await Pair.findOne({
            where: { 
                [Op.and]: [
                    { tokenA: req.body.tokenA },
                    { tokenB: req.body.tokenB },
                    { pair_exchange: req.body.pair_exchange }
                ]  
            } 
        });
        const pair2 = await Pair.findOne({ 
            where: { 
                [Op.and]: [
                    { tokenA: req.body.tokenB },
                    { tokenB: req.body.tokenA },
                    { pair_exchange: req.body.pair_exchange }
                ]  
            } 
        });
        return res.status(200).send({
            message: 'succes',
            pair1: pair1,
            pair2: pair2
        });
    } catch (err) {
        return res.status(500).send({
            message: 'error',
            data: err.message
        });
    }
}

module.exports = {
    checkClient,
    checkExchange,
    checkToken,
    checkPair
}