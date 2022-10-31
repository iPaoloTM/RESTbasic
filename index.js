'use strict';

const config = require('./config');
const app = require('./app/app');
const mobilizon = require('./app/helperClass/mobilizonGraphQL')

const PORT = process.env.PORT || 6000;

config.initDB()
    .then(msg => {
        console.log(msg);

        const server = app.listen(PORT, () => {
            console.log("Server started. Port: ", PORT);
        });
    })
    .catch(err => {
        throw(new Error(err));
    });

    
mobilizon.getEvents().then( events => {
    //HERE call the function to put the events in the database
    console.log(events)
  }).catch(err => {
    console.log(error);
  });
  


