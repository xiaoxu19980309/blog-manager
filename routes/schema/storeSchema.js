const mongoose = require('mongoose');
const Schema = mongoose.Schema
var objectId = require('mongodb').ObjectId;

let storeSchema = new mongoose.Schema({
  articleId: { type: Schema.Types.ObjectId,ref: 'issues'},
  userId: { type: Schema.Types.ObjectId,ref: 'users'},
  gmt_create: String,
  gmt_modified: String,
},{versionKey: false})

module.exports = storeSchema;