const mongoose = require('mongoose');
var objectId = require('mongodb').ObjectId;

let issuesSchema = new mongoose.Schema({
  userId: objectId,
  title: String,
  content: String,
  noReprint: Boolean,
  gmt_create: String,
  gmt_modified: String
},{versionKey: false})

module.exports = issuesSchema;