'use strict';

const config = require('./config');
const app = require('./app/app');

const PORT = process.env.PORT || 5000;

config.initDB()
    .then(msg => {
        console.log(msg);

        const server = app.listen(PORT, () => {
            console.log("Server started");
        });
    })
    .catch(err => {
        throw(new Error(err));
    });