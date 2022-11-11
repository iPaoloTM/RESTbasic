const path = require("path");
const fs = require('fs');
const mongoose = require('mongoose');
var convertJsonSchemaToMongoose = require("convert-json-schema-to-mongoose")

const schema = JSON.parse(fs.readFileSync(path.resolve(__dirname,"./event.schema.json")));

const EventSchema = new mongoose.Schema(convertJsonSchemaToMongoose.createMongooseSchema({}, schema));

EventSchema.index({"uuid": "text"},{unique: true})

EventSchema.index({"physicalAddress.geo": "2dsphere"});

module.exports = EventSchema;