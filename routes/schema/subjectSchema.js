const mongoose = require('mongoose');
const Schema = mongoose.Schema
var objectId = require('mongodb').ObjectId;

let subjectSchema = new mongoose.Schema({
  userId: { type: Schema.Types.ObjectId,ref: 'users'},
  name: String,
  photo: String,
  description: String,
  articleList: [{type: Schema.Types.ObjectId, ref: 'issues'}],
  fansList: [{type: Schema.Types.ObjectId, ref: 'users'}],
  gmt_create: String,
  gmt_modified: String,
},{versionKey: false})

module.exports = subjectSchema;