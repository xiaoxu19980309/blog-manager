const mongoose = require('mongoose');
const Schema = mongoose.Schema
var objectId = require('mongodb').ObjectId;

let articleSchema = new mongoose.Schema({
  collectionId: {type: Schema.Types.ObjectId,ref: 'collections'}, // 文集ID
  title: String, // 标题
  content: String, // 内容代码
  content_text: String, // 内容文本
  has_publish: Boolean, // 是否已发表
  noReprint: Boolean, // 禁止转载
  gmt_create: String, // 创建时间
  gmt_modified: String, // 最后修改时间
},{versionKey: false})


module.exports = articleSchema;