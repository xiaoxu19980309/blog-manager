const mongoose = require('mongoose');
const Schema = mongoose.Schema
var objectId = require('mongodb').ObjectId;

let articleSchema = new mongoose.Schema({
  collectionId: {type: Schema.Types.ObjectId,ref: 'collections'},
  title: String,
  content: String,
  has_publish: Boolean,
  noReprint: Boolean,
  gmt_create: String,
  gmt_modified: String,
},{versionKey: false})


module.exports = articleSchema;