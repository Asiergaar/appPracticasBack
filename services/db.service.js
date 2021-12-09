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
    return await Capital.create({
        capital_client: client,
        capital_date: date,
        capital_quantity: quantity,
        capital_progress: progress
    });
}

async function createExchange(name, url, imgUrl) {
    return await Exchange.create({
        exchange_name: name,
        URL: url,
        exchange_img_url: imgUrl
    });
}

async function createClient(name, surname, email, entry_date, start_capital) {
    return await Client.create({
       client_name: name,
       client_surname: surname,
       email: email,
       entry_date: entry_date,
       start_capital: start_capital
   });
}

async function createNewCapital(date, quantity, client) {
    return await NewCapital.create({
        newcapital_date: date,
        newcapital_quantity: quantity,
        newcapital_client: client,
    });
}

async function createPair(tokenA, tokenB, exchange) {
    return await Pair.create({
        tokenA: tokenA,
        tokenB: tokenB,
        pair_exchange: exchange,
    });
}

async function createPool(date, quantity, pair) {
    return await Pool.create({
        pool_date: date,
        invested_quantity: quantity,
        pool_pair: pair
    });
}

async function createProgress(date, percentage) {
    return await Progress.create({
        progress_date: date,
        progress_percentage: percentage
    });
}

async function createToken(name, ticker, imgUrl) {
    return await Token.create({
        token_name: name,
        ticker: ticker,
        token_img_url: imgUrl
    });
}

/*
 *  UPDATE
 */

async function updateCapitalQuantity(newquantity, id) {
    return await Capital.update({
        capital_quantity: newquantity}, {
        where: {
            capital_id: id
        }
    });
}

async function updateExchange(name, url, imgUrl, id) {
    await Exchange.update({ 
        exchange_name: name,
        URL: url,
        exchange_img_url: imgUrl }, {
        where: {
            exchange_id: id
        }
    })
    .then(async (result) => {
        return await Exchange.findByPk(id);
    })
    .catch((err) => {
        return err.status(500);
    });
}

async function updateClient(name, surname, email, id) {
    await Client.update({ 
        client_name: name,
        client_surname: surname,
        email: email }, {
        where: {
            client_id: id
        }
    })
    .then(async (result) => {
        return await Client.findByPk(id);
    })
    .catch((err) => {
        return err.status(500);
    });
}

async function updatePair(tokenA, tokenB, exchange, id) {
    await Pair.update({ 
        tokenA: tokenA,
        tokenB: tokenB,
        pair_exchange: exchange, }, {
        where: {
            pair_id: id
        }
    })
    .then(async (result) => {
        return await Pair.findByPk(id);
    })
    .catch((err) => {
        return err.status(500);
    });
}

async function updatePool(date, quantity, pair, id) {
    await Pool.update({ 
        pool_date: date,
        invested_quantity: quantity,
        pool_pair: pair }, {
        where: {
            pool_id: id
        }
    })
    .then(async (result) => {
        return await Pool.findByPk(id);
    })
    .catch((err) => {
        return err.status(500);
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
    await Token.update({ 
        token_name: name,
        ticker: ticker,
        token_img_url: imgUrl }, {
        where: {
            token_id: id
        }
    })
    .then(async (result) => {
        return await Token.findByPk(id);
    })
    .catch((err) => {
        return err.status(500);
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