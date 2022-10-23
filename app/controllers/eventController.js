'use strict';

const mongoose = require('mongoose');
const model = require('../models/event');
const Event = mongoose.model('Event',model);

let MSG = {
    eventNotFound: "Event not found",
    updateFailed: "Event update failed",
    createFailed: "Event create failed"
}

module.exports.get_events = (req, res) => {};

module.exports.create_event = (req, res) => {
    
};

module.exports.delete_events = (req, res) => {};

module.exports.get_event = (req, res) => {
    Event.findOne(
        {
            "uuid": req.params.uuid
        },
        (err, event) => {
            if(err || event == null){
                res.status(400).json({
                    error: MSG.eventNotFound
                })
            } else {
                res.status(200).json(event)
            }
        }
    )
};

module.exports.update_event = (req, res) => {
    let uuid = req.params.uuid;
    let title = req.body.title;
    let category = req.body.category
    let description = req.body.description
    let dates = req.body.dates
    let joinOptions = req.body.joinOptions
    let website = req.body.website
    let physicalAddress = req.body.physicalAddress
    let contacts = req.body.contacts
    
    Event.findOneAndUpdate({
            "uuid": uuid
        }, {
            "title": title,
            "category": category,
            "description": description,
            "dates": dates,
            "joinOptions": joinOptions,
            "website": website,
            "physicalAddress": physicalAddress,
            "contacts": contacts
        }, {
            new:true
        },
        (err, event) => {
            if (err) {
                res.status(400).json({
                    error: MSG.updateFailed
                })
            }
            else {
                res.status(200).json(event);
            }
        }
    )
};

module.exports.delete_event = (req, res) => {
    Event.deleteOne(
        {
            "uuid": req.params.uuid
        },
        (err, op) => {
            if(err || op.deletedCount == 0){
                res.status(400).json({
                    error: MSG.eventNotFound
                })
            } else {
                res.status(200).json("Event deleted")
            }
        }
    )
};