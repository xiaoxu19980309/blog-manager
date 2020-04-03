const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var objectId = require('mongodb').ObjectId;

let contribution = new mongoose.Schema({
  userId: {type: Schema.Types.ObjectId,ref: 'users'},
  articleId: {type: Schema.Types.ObjectId, ref: 'issues'},
  subjectId: {type: Schema.Types.ObjectId, ref: 'subjects'},
  isChecked: Boolean,
  isPassed: Boolean,
  gmt_create: String,
  gmt_modified: String,
},{versionKey: false})

module.exports = contribution;