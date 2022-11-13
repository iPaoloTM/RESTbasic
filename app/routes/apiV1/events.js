'use strict';

const express = require('express');
const router = express.Router();

const eventHandler = require('../../controllers/eventController');

router.get('/', eventHandler.get_events);

router.post('/', eventHandler.create_event);

router.delete('/', eventHandler.delete_events);

router.get('/count', eventHandler.count_events);

router.get('/:uuid', eventHandler.get_event);

router.put('/:uuid', eventHandler.update_event);

router.delete('/:uuid', eventHandler.delete_event);

module.exports = router;