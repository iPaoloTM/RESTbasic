'use strict';

const express = require('express');
const router = express.Router();

const eventHandler = require('../../controllers/eventController');

router.get('/', eventHandler.get_events);

router.post('/', eventHandler.create_event);

module.exports = router;