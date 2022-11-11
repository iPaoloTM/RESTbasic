'use strict';

var mongoose = require('mongoose');
const dotenv = require("dotenv").config();

const DB_NAME = "events_db";
const DB_CONNECTION_STRING = `mongodb://localhost:27017/${DB_NAME}`;
const DB_USER = process.env.MONGO_ROOT_USER;
const DB_PASS = process.env.MONGO_ROOT_PWD;


module.exports.initDB = (dbname=DB_NAME) => {

    return new Promise((resolve, reject) => {
        mongoose.connect(DB_CONNECTION_STRING, {
            authSource: "admin",
            user: DB_USER,
            pass: DB_PASS,
            useNewUrlParser: true
        }, (err) => {
            if (err) {
                console.log(err);
                reject("DB can't connect");
            }
            resolve("DB connected");
        });
    }) 
} 