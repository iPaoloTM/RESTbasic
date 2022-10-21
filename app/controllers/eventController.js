'use strict';

const mongoose = require('mongoose');
const model = require('../models/event');
const Event = mongoose.model('Event',model);

let MSG = {
    noteNotFound: "Nota non trovata",
    updateFailed: "Salvataggio nota fallito"
}

module.exports.get_events = (req, res) => {};

module.exports.create_event = (req, res) => {};

module.exports.delete_events = (req, res) => {};

module.exports.get_event = (req, res) => {};

module.exports.update_event = (req, res) => {};

module.exports.delete_event = (req, res) => {};