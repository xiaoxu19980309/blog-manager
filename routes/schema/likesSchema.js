const mongoose = require('mongoose');
var objectId = require('mongodb').ObjectId;

let likeSchema = new mongoose.Schema({
  articleId: objectId,
  userId: objectId,
  status: Number, // 1喜欢 2不喜欢 0无状态
  gmt_create: String,
  gmt_modified: String,
},{versionKey: false})

module.exports = likeSchema