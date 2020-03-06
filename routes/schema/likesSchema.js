const mongoose = require('mongoose');
var objectId = require('mongodb').ObjectId;

let likeSchema = new mongoose.Schema({
  articleId: objectId,
  userId: objectId,
  status: Number,
  gmt_create: String,
  gmt_modified: String,
},{versionKey: false})

module.exports = likeSchema