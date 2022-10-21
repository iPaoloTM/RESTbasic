'use strict';

const express = require('express');
const apiV1 = express.Router();

const eventsRouter = require('./apiV1/events');

// middleware that tracks request
apiV1.use(function timeLog(req, res, next) {
  console.log(`Requested ${req.originalUrl} From ${req.headers['x-forwarded-for']} Time: ${Date.now()}`);
	next();
});

apiV1.use('/events', eventsRouter);

module.exports = apiV1;