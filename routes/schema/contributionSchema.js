const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var objectId = require('mongodb').ObjectId;

let contribution = new mongoose.Schema({
  userId: {type: Schema.Types.ObjectId,ref: 'users'}, // 用户ID
  articleId: {type: Schema.Types.ObjectId, ref: 'issues'}, // 文章ID
  subjectId: {type: Schema.Types.ObjectId, ref: 'subjects'}, // 专题ID
  isChecked: Boolean, // 是否已读
  isPassed: Boolean, // 投稿是否通过
  gmt_create: String, // 创建时间
  gmt_modified: String, // 最后修改时间
},{versionKey: false})

module.exports = contribution;