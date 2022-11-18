'use strict';

const mongoose = require('mongoose');
const model = require('../models/event');
const Event = mongoose.model('Event',model);
const { v4: uuidv4 } = require('uuid');

let MSG = {
    eventNotFound: "Event not found", //Error code: 404
    conflict: "Event already existent", //Error code: 409
    badRequest: "Bad Request", //Error code: 400
    serverError: "Server error", //Errorr code: 500
}

module.exports.get_events = (req, res) => {

    Event.find((err,event) => {
        if (err) {
            console.log(err)
            res.status(500).json({
                error: MSG.serverError
            })
        }
        else {
            res.status(200).json({
                events: event,
            });
        }
    });
};

module.exports.create_event = (req, res) => {
    let uuid = uuidv4();
    let title = req.body.title;
    let category = req.body.category;
    let description = req.body.description;
    let dates = req.body.dates;
    let joinOptions = req.body.joinOptions;
    let website = req.body.website;
    let physicalAddress = req.body.physicalAddress;
    let contacts = req.body.contacts;

    if(title == undefined || category == undefined || dates == undefined || physicalAddress == undefined){
        res.status(400).json({ error: MSG.badRequest });
		return;
    }

    Event.create({
        "uuid": uuid,
        "title": title,
        "category": category,
        "description": description,
        "dates": dates,
        "joinOptions": joinOptions,
        "website": website,
        "physicalAddress": physicalAddress,
        "contacts": contacts
    },
    (err, event) => {
        if (err) {
            if(err.code == 121){                //121 validation error
                res.status(400).json({
                    error: MSG.badRequest
                })
            } else if(err.code == 11000){       //11000 duplicated key
                res.status(409).json({
                    error: MSG.conflict
                })
            } else {                            //all other cases general server error
                res.status(500).json({
                    error: MSG.serverError
                })
            }
        }
        else {
            res.status(200).json(event);
        }
    })
};