'use strict'

const Capital = require('../models/capital.model');
const { QueryTypes } = require('sequelize');
const sequelize = require('../database');

// GET /capitals
async function getCapitals (req, res) {
    const capitals = await Capital.findAll();
    return res.status(200).send({
        message: 'success',
        data: capitals
    });
}

// GET /capital/id
async function getCapital (req, res) {
    const id = req.params.id;
    const capital = await Capital.findAll({
        where: {
          capital_id: id
        }
    });
    return res.status(200).send({
        message: 'success',
        data: capital
    });
}

// POST /capital/create
async function addCapitals (req, res) {

    let client_id;
    var date = new Date();
    let capital_quantity = 1;

    // get the progress
    let progress_id = 1;

    // for all the clients
        // Create the capital on DB
        const capital = await Capital.create({
            capital_client: client_id,
            capital_date: date,
            capital_quantity: capital_quantity,
            capital_progress: progress_id
        });
        
    return res.status(200).send({
        message: 'success',
        data: capital
    });
}

module.exports = {
    getCapitals,
    addCapitals,
    getCapital
}