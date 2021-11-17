'use strict'

const Token = require('../models/token.model');

// GET /token
async function getTokens (req, res) {
    try {
        const tokens = await Token.findAll();
        return res.status(200).send({
            message: 'success',
            data: tokens
        });
    } catch (err) {
        return res.status(500).send({
            message: 'error',
            data: err
        });
    }
}

// GET /token/id
async function getToken (req, res) {
    try {
        const token = await Token.findAll({ where: { token_id: req.params.id } });
        return res.status(200).send({
            message: 'success',
            data: token
        });
    } catch (err) {
        return res.status(500).send({
            message: 'error',
            data: err
        });
    }
}

// POST /token/create
async function addToken (req, res) {
    try {
        const token = await Token.create(req.body.token_name, req.body.ticker, req.body.token_img_url);
        return res.status(200).send({
            message: 'success',
            data: token
        });
    } catch (err) {
        return res.status(500).send({
            message: 'error',
            data: err
        });
    }
}

// POST /token/edit/2
async function editToken (req, res) {
    try {
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
    } catch (err) {
        return res.status(500).send({
            message: 'error',
            data: err
        });
    }
}

module.exports = {
    getTokens,
    addToken,
    getToken,
    editToken
}