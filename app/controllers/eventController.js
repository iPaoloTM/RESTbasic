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
    let category = req.query.category;
    let date = req.query.date;
    let city = req.query.city;
    let radius,geo;
    try {
        geo = req.query.geo.split(",");
        for (let i = 0; i < geo.length; i++) {
            geo[i] = parseFloat(geo[i]);
        }
        radius = parseFloat(req.query.radius);
    } catch (error) {
        geo = undefined;
        radius = undefined;
    }

    let aggregation = [
    {
        $match: {},
    },
    {
        $project: {
            _id: 0,
            uuid: 1,
        }
    }];
    if (category != undefined) {
        aggregation[0].$match.category = category;
    }
    if (date != undefined) {
        aggregation[0].$match["$and"] = [{
            "dates.start": {
                $lte: new Date(date)
            }
        },{
            "dates.end": {
                $gte: new Date(date)
            }
        }];
    }
    if (city != undefined) {
        aggregation[0].$match["physicalAddress.city"] = city;
    }
    if (geo != undefined && radius != undefined) {
        aggregation.unshift({
            $geoNear: {
               near: { type: "Point", coordinates: geo },
               distanceField: "distance",
               maxDistance: radius,
            }
          }
        );
    }

    Event.aggregate(aggregation,
    (err,event) => {
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

    if(uuid == undefined || title == undefined || category == undefined || dates == undefined || physicalAddress == undefined){
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
            console.error(err);
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

module.exports.delete_events = (req, res) => {
    let category = req.query.category;
    let startDate = req.query.startDate;
    let endDate = req.query.endDate;
    let city = req.query.city;
    let radius,geo;
    try {
        geo = req.query.geo.split(",");
        for (let i = 0; i < geo.length; i++) {
            geo[i] = parseFloat(geo[i]);
        }
        radius = parseFloat(req.query.radius);
    } catch (error) {
        geo = undefined;
        radius = undefined;
    }
    
    let match = {};
    if (category != undefined) {
        match.category = category;
    }
    if (startDate != undefined) {
        match["dates.start"] = startDate;
    }
    if (endDate != undefined) {
        match["dates.end"] = endDate;
    }
    if (city != undefined) {
        match["physicalAddress.city"] = city;
    }
    if (geo != undefined && radius != undefined) {
        match["physicalAddress.geo"] = {
            $near: {
                $geometry: {
                    type: "Point" ,
                    coordinates: geo
                },
                $maxDistance: radius,
            }
        };
    }

    Event.deleteMany(match,(err,event) => {
        if (err) {
            console.log(err)
            res.status(500).json({
                error: MSG.serverError
            })
        }
        else {
            res.status(200).json({
                events: event.deletedCount,
            });
        }
    });
};

module.exports.count_events = (req, res) => {

    let category = req.query.category;
    
    Event.count({
        category: category
    },
    (err,event) => {
        if (err) {
            console.log(err);
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

module.exports.get_event = (req, res) => {
    Event.findOne(
        {
            "uuid": req.params.uuid
        },
        (err, event) => {
            if(err){
                res.status(500).json({
                    error: MSG.serverError
                })
            } else if(event == null){                          //Never return error, it only returns null event collection
                res.status(404).json({
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
            if (err || event == null) {

                if(err && err.code == 121){                //121 validation error
                    res.status(400).json({
                        error: MSG.badRequest
                    })
                } else if(event ==  null){      
                    res.status(404).json({
                        error: MSG.eventNotFound
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
        }
    )
};

module.exports.delete_event = (req, res) => {
    Event.deleteOne(
        {
            "uuid": req.params.uuid
        },
        (err, op) => {
            if(op.deletedCount == 0){                       //if event not found
                res.status(404).json({
                    error: MSG.eventNotFound
                })
            } else if (err){
                res.status(500).json({
                    error: MSG.serverError
                })
            } else {
                res.status(200).json("Event deleted")
            }
        }
    )
};