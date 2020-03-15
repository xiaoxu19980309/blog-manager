const mongoose = require('mongoose');
const Schema = mongoose.Schema
var objectId = require('mongodb').ObjectId;

let issuesSchema = new mongoose.Schema({
  userId: {type: Schema.Types.ObjectId,ref: 'users'},
  title: String,
  content: String,
  content_text: String,
  noReprint: Boolean,
  gmt_create: String,
  gmt_modified: String
},{versionKey: false})

module.exports = issuesSchema;