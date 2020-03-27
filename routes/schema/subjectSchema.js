const mongoose = require('mongoose');
const Schema = mongoose.Schema
var objectId = require('mongodb').ObjectId;

let subjectSchema = new mongoose.Schema({
  userId: { type: Schema.Types.ObjectId,ref: 'users'},
  articleList: [{type: Schema.Types.ObjectId, ref: 'issues'}],
  gmt_create: String,
  gmt_modified: String,
},{versionKey: false})

module.exports = subjectSchema;