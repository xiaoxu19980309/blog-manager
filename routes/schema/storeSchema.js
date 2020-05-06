const mongoose = require('mongoose');
const Schema = mongoose.Schema
var objectId = require('mongodb').ObjectId;

let storeSchema = new mongoose.Schema({
  articleId: { type: Schema.Types.ObjectId,ref: 'issues'}, // 收藏文章ID
  userId: { type: Schema.Types.ObjectId,ref: 'users'}, // 用户ID
  gmt_create: String, // 创建时间
  gmt_modified: String, // 最后修改时间
},{versionKey: false})

module.exports = storeSchema;