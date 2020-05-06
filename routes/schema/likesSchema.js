const mongoose = require('mongoose');
const Schema = mongoose.Schema
var objectId = require('mongodb').ObjectId;

let likeSchema = new mongoose.Schema({
  articleId: { type: Schema.Types.ObjectId,ref: 'issues'}, // 文章ID
  userId: { type: Schema.Types.ObjectId,ref: 'users'}, // 用户ID
  status: Number, // 1喜欢 2不喜欢 0无状态
  gmt_create: String, // 创建时间
  gmt_modified: String, // 最后修改时间
},{versionKey: false})

module.exports = likeSchema