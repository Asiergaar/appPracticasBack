'use strict'

const nodemailer = require('../node_modules/nodemailer');
const converter = require('../node_modules/json-2-csv');

// convert json to csv
async function jsonToCsv(jsonFile) {
    return new Promise(resolve =>{
        converter.json2csv(jsonFile, (err, csv) => {
            if (err) { throw err; }
            resolve(csv);
        })
    })
}

module.exports = {
    jsonToCsv
}