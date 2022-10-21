'use strict';

var mongoose = require('mongoose');
const DB_NAME = "events_db";
const DB_CONNECTION_STRING = `mongodb://localhost:27017/${DB_NAME}`;

module.exports.initDB = (dbname=DB_NAME) => {

    return new Promise((resolve, reject) => {
        mongoose.connect(DB_CONNECTION_STRING, {
            useNewUrlParser: true
        }, (err) => {
            if (err) reject("DB can't connect");
            resolve("DB connected");
        });
    }) 
} 