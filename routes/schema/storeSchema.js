const mongoose = require('mongoose');
var objectId = require('mongodb').ObjectId;

let storeSchema = new mongoose.Schema({
  articleId: objectId,
  userId: objectId,
  gmt_create: String,
  gmt_modified: String,
},{versionKey: false})

module.exports = storeSchema;