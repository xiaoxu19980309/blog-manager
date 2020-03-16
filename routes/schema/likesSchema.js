const mongoose = require('mongoose');
const Schema = mongoose.Schema
var objectId = require('mongodb').ObjectId;

let likeSchema = new mongoose.Schema({
  articleId: { type: Schema.Types.ObjectId,ref: 'issues'},
  userId: { type: Schema.Types.ObjectId,ref: 'users'},
  status: Number, // 1喜欢 2不喜欢 0无状态
  gmt_create: String,
  gmt_modified: String,
},{versionKey: false})

module.exports = likeSchema