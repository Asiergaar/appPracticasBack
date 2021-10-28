'use strict'

const Token = require('../models/token.model');

// GET /token
async function getTokens (req, res) {
    const tokens = await Token.findAll();
    return res.status(200).send({
        message: 'success',
        data: tokens
    });
}

// GET /token/id
async function getToken (req, res) {
    const id = req.params.id;
    console.log(id);
    const token = await Token.findAll({
        where: {
            token_id: id
        }
    });
    return res.status(200).send({
        message: 'success',
        data: token
    });
}

// POST /token/create
async function addToken (req, res) {
    const token = await Token.create({
        token_name: req.body.token_name,
        ticker: req.body.ticker,
        token_img_url: req.body.token_img_url
    });
    return res.status(200).send({
        message: 'success',
        data: token
    });
}

// POST /token/edit/2
async function editToken (req, res) {
    const id = req.params.id;
    const token = await Token.update({ 
        token_name: req.body.token_name,
        ticker: req.body.ticker,
        token_img_url: req.body.token_img_url }, {
        where: {
            token_id: id
        }
    })
    .then(async (result) => {
        const token = await Token.findByPk(id);
        console.log(token);
        return res.status(200).send({
            message: 'success',
            data: token
        })
    })
    .catch((err) => {
        return res.status(500);
    });
}

module.exports = {
    getTokens,
    addToken,
    getToken,
    editToken
}