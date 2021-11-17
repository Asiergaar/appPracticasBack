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

// Raw query
async function query(query) {
    return await sequelize.query(query, { type: QueryTypes.SELECT});
}

/* 
 * Add to database
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

module.exports = {
    query,
    createCapital,
    createClient,
    createExchange,
    createNewCapital,
    createPair,
    createPool,
    createProgress,
    createToken
}