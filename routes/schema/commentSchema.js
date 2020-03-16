const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var objectId = require('mongodb').ObjectId;

let commentSchema = new mongoose.Schema({
  userId: {type: Schema.Types.ObjectId,ref: 'users'},
  content: String,
  replyList: [{
    userId: {type: Schema.Types.ObjectId,ref: 'users'},
    content: String,
    gmt_create: String
  }],
  gmt_create: String,
  gmt_modified: String,
},{versionKey: false})

module.exports = commentSchema;