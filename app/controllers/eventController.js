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

    let radius,response,date,geo;

    let category = req.query.category;
    let strDate = req.query.date;
    let city = req.query.city;
    let strGeo = req.query.geo;
    let strRadius = req.query.radius;
    let code = 200;
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

    if (strDate != undefined) {
        date = new Date(strDate);
        if (checkDate(date)) {
            aggregation[0].$match.$and = [{
                "dates.start": {
                    $lte: date
                }
            },{
                "dates.end": {
                    $gte: date
                }
            }];
        } else {
            code = 400;
            response = MSG.badRequest;
        }
    }

    if (city != undefined) {
        aggregation[0].$match["physicalAddress.city"] = city;
    }

    if (strGeo != undefined && strRadius != undefined) {
        geo = strGeo.split(",");
        for (let i = 0; i < geo.length; i++) {
            geo[i] = parseFloat(geo[i]);
        }
        radius = parseFloat(strRadius);
        if (checkCoordinates(geo) && !isNaN(radius)) {
            aggregation.unshift({
                    $geoNear: {
                        near: { type: "Point", coordinates: geo },
                        distanceField: "distance",
                        maxDistance: radius,
                    }
                }
            );
        } else {
            code = 400;
            response = MSG.badRequest;
        }
    } else if (strGeo != undefined && strRadius == undefined || strGeo == undefined && strRadius != undefined) {
        code = 400;
        response = MSG.badRequest;
    }

    if (code == 200) {
        Event.aggregate(aggregation,
            (err,event) => {
                if (err) {
                    console.log(err);
                    res.status(500).json({
                        error: MSG.serverError,
                    });
                }
                else {
                    res.status(200).json({
                        events: event,
                    });
                }
            });
    } else {
        res.status(code).json({
            error: response,
        })
    }
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

    let radius,response,date,geo;

    let category = req.query.category;
    let strDate = req.query.date;
    let city = req.query.city;
    let strGeo = req.query.geo;
    let strRadius = req.query.radius;
    let code = 200;
    let match = {};
    
    if (category != undefined) {
        match.category = category;
    }

    if (strDate != undefined) {
        date = new Date(strDate);
        if (checkDate(date)) {
            match.$and = [{
                "dates.start": {
                    $lte: date
                }
            },{
                "dates.end": {
                    $gte: date
                }
            }];
        } else {
            code = 400;
            response = MSG.badRequest;
        }
    }

    if (city != undefined) {
        match["physicalAddress.city"] = city;
    }

    if (strGeo != undefined && strRadius != undefined) {
        geo = strGeo.split(",");
        for (let i = 0; i < geo.length; i++) {
            geo[i] = parseFloat(geo[i]);
        }
        radius = parseFloat(strRadius);
        if (checkCoordinates(geo) && !isNaN(radius)) {
            match["physicalAddress.geo"] = {
                $near: {
                    $geometry: {
                        type: "Point" ,
                        coordinates: geo
                    },
                    $maxDistance: radius,
                }
            };
        } else {
            code = 400;
            response = MSG.badRequest;
        }
    } else if (strGeo != undefined && strRadius == undefined || strGeo == undefined && strRadius != undefined) {
        code = 400;
        response = MSG.badRequest;
    }

    if (code == 200) {
        Event.deleteMany(match,(err,event) => {
            if (err) {
                console.log(err);
                res.status(500).json({
                    error: MSG.serverError
                });
            }
            else {
                res.status(200).json({
                    events: event.deletedCount,
                });
            }
        });
    } else {
        res.status(code).json({
            error: response,
        })
    }
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

function checkDate(date) {
    return !isNaN(date.valueOf());
}

function checkCoordinates(geo) {
    return geo.length == 2 && !isNaN(geo[0]) && geo[0] >= -180 && geo[0] <= 180 && !isNaN(geo[1]) && geo[1] >= -90 && geo[1] <= 90;
}