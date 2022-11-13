const config = require('./config');
const mobilizon = require('./app/helperClass/mobilizonGraphQL');
const model = require('./app/models/event');
const mongoose = require('mongoose');
const sample_events = require("./sample_events.json");

(new Promise((resolve,reject) => {
    if (mongoose.connection.readyState !== 1) {
        config.initDB().then(() => {
            resolve();
        }).catch(err => {
            reject(err);
        });
    } else {
        resolve();
    }
})).then(async () => {
    Event = mongoose.model('Event',model);
    await Event.collection.drop();
    await Event.createCollection();

    await mobilizon.getEvents().then( events => {
        for (const event of events.events.elements) {
            Event.create({
                "uuid": event.uuid,
                "title": event.title,
                "category": event.category,
                "description": event.description,
                "dates": {
                    "start": event.beginsOn,
                    "end": event.endsOn,
                },
                "joinOptions": event.joinOptions,
                "website": event.onlineAddres,
                "physicalAddress": {
                    "geo": {
                        "type": "Point",
                        "coordinates": event.physicalAddress.geom.split(";")
                    },
                    "country": event.physicalAddress.country,
                    "region": event.physicalAddress.region,
                    "postalCode": event.physicalAddress.postalCode,
                    "city": event.physicalAddress.city,
                    "street": event.physicalAddress.street,
                },
                "contacts": [],
            });
        }
        console.log("Mobilizon events inserted");
    }).catch(err => {
        console.error("Mobilizon events not retireved");
    });
    
    await (new Promise((resolve,reject) => Event.insertMany(sample_events, function(err,result) {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          console.log("Sample events inserted");
          resolve();
        }
    })));

    process.exit(0);
});