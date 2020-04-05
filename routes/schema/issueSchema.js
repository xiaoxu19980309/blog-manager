const mongoose = require('mongoose');
const Schema = mongoose.Schema
var objectId = require('mongodb').ObjectId;
var commentSchema = require('./commentSchema')
mongoose.set('useFindAndModify', false)

let issuesSchema = new mongoose.Schema({
  userId: {type: Schema.Types.ObjectId,ref: 'users'},
  title: String,
  content: String,
  content_text: String,
  commentList: [{
    type: Schema.Types.ObjectId, ref: 'comments'
  }],
  likesList: [{
    type: Schema.Types.ObjectId, ref: 'likes'
  }],
  subjectName: String,
  subjectId: String,
  likesCount: Number,
  commentsCount: Number,
  noReprint: Boolean,
  gmt_create: String,
  gmt_modified: String
},{versionKey: false})

module.exports = issuesSchema;