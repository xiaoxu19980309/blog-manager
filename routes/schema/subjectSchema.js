const mongoose = require('mongoose');
const Schema = mongoose.Schema
var objectId = require('mongodb').ObjectId;

let subjectSchema = new mongoose.Schema({
  userId: { type: Schema.Types.ObjectId,ref: 'users'}, // 用户ID
  name: String, // 专题名
  photo: String, // 头像
  description: String, // 简介
  articleList: [{type: Schema.Types.ObjectId, ref: 'issues'}], // 文章列表
  fansList: [{type: Schema.Types.ObjectId, ref: 'users'}], // 粉丝列表
  gmt_create: String, // 创建时间
  gmt_modified: String, // 最后修改时间
},{versionKey: false})

module.exports = subjectSchema;