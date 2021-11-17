'use strict'

const sequelize = require('../database');
const { QueryTypes } = require('sequelize');

//Models
const Client = require('../models/client.model');
const Exchange = require('../models/exchange.model');
const Token = require('../models/token.model');
const Pair = require('../models/pair.model');
const Pool = require('../models/pool.model');
const Progress = require('../models/progress.model');
const Capital = require('../models/capital.model');
const NewCapital = require('../models/newcapital.model');


/*
 * This controller manage the queries with the database
 */


// RAW QUERY
async function query(query) {
    return await sequelize.query(query, { type: QueryTypes.SELECT});
}


/* 
 * CREATE
 */

async function createCapital(client, date, quantity, progress) {
    const capital = await Capital.create({
        capital_client: client,
        capital_date: date,
        capital_quantity: quantity,
        capital_progress: progress
    });
    return capital;
}

async function createExchange(name, url, imgUrl) {
    const exchange = await Exchange.create({
        exchange_name: name,
        URL: url,
        exchange_img_url: imgUrl
    });
    return exchange;
}

async function createClient(name, surname, email, entry_date, start_capital) {
    const client = await Client.create({
       client_name: name,
       client_surname: surname,
       email: email,
       entry_date: entry_date,
       start_capital: start_capital
   });
   return client;
}

async function createNewCapital(date, quantity, client) {
    const newcapital = await NewCapital.create({
        newcapital_date: date,
        newcapital_quantity: quantity,
        newcapital_client: client,
    });
    return newcapital;
}

async function createPair(tokenA, tokenB, exchange) {
    const pair = await Pair.create({
        tokenA: tokenA,
        tokenB: tokenB,
        pair_exchange: exchange,
    });
    return pair
}

async function createPool(date, quantity, pair) {
    const pool = await Pool.create({
        pool_date: date,
        invested_quantity: quantity,
        pool_pair: pair
    });
   return pool;
}

async function createProgress(date, percentage) {
    const progress =  await Progress.create({
        progress_date: date,
        progress_percentage: percentage
    });
    return progress;
}

async function createToken(name, ticker, imgUrl) {
    const token = await Token.create({
        token_name: name,
        ticker: ticker,
        token_img_url: imgUrl
    });
    return token;
}

/*
 *  UPDATE
 */

async function updateCapitalQuantity(newquantity, id) {
    const capital = await Capital.update({
        capital_quantity: newquantity}, {
        where: {
            capital_id: id
        }
    });
    return capital;
}

async function updateExchange(name, url, imgUrl, id) {
    const exchange = await Exchange.update({ 
        exchange_name: name,
        URL: url,
        exchange_img_url: imgUrl }, {
        where: {
            exchange_id: id
        }
    })
    .then(async (result) => {
        const exchange = await Exchange.findByPk(id);
        return exchange;
    })
    .catch((err) => {
        return res.status(500);
    });
}

async function updateClient(name, surname, email, id) {
    const client = await Client.update({ 
        client_name: name,
        client_surname: surname,
        email: email }, {
        where: {
            client_id: id
        }
    })
    .then(async (result) => {
        const client = await Client.findByPk(id);
        return client;
    })
    .catch((err) => {
        return res.status(500);
    });
}

async function updatePair(tokenA, tokenB, exchange, id) {
    const pair = await Pair.update({ 
        tokenA: tokenA,
        tokenB: tokenB,
        pair_exchange: exchange, }, {
        where: {
            pair_id: id
        }
    })
    .then(async (result) => {
        const pair = await Pair.findByPk(id);
        return pair;
    })
    .catch((err) => {
        return res.status(500);
    });
}

async function updatePool(date, quantity, pair, id) {
    const pool = await Pool.update({ 
        pool_date: date,
        invested_quantity: quantity,
        pool_pair: pair }, {
        where: {
            pool_id: id
        }
    })
    .then(async (result) => {
        const pool = await Pool.findByPk(id);
        return pool;
    })
    .catch((err) => {
        return res.status(500);
    });
}

async function updatePoolQuantity(quantity, id) {
    await Pool.update({
        invested_quantity: quantity }, {
        where: {
            pool_id: id
        }
    });
}

async function updateProgress(date, benefit, id) {
    await Progress.update({
        progress_date: date,
        progress_percentage: benefit }, {
        where:{
            progress_id: id
        }
    });
}

async function updateToken(name, ticker, imgUrl, id) {
    const token = await Token.update({ 
        token_name: name,
        ticker: ticker,
        token_img_url: imgUrl }, {
        where: {
            token_id: id
        }
    })
    .then(async (result) => {
        const token = await Token.findByPk(id);
        return token;
    })
    .catch((err) => {
        return res.status(500);
    });
}

module.exports = {
    query,
    createCapital,
    createClient,
    createExchange,
    createNewCapital,
    createPair,
    createPool,
    createProgress,
    createToken,
    updateCapitalQuantity,
    updateClient,
    updateExchange,
    updatePair,
    updatePool,
    updatePoolQuantity,
    updateProgress,
    updateToken
}