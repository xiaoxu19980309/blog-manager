const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var objectId = require('mongodb').ObjectId;

let commentSchema = new mongoose.Schema({
  userId: {type: Schema.Types.ObjectId,ref: 'users'}, // 用户ID
  articleId: {type: Schema.Types.ObjectId, ref: 'issues'}, // 文章ID
  content: String, // 评论内容
  replyList: [{ // 回复列表
    userId: {type: Schema.Types.ObjectId,ref: 'users'}, // 用户ID
    content: String, // 回复内容
    gmt_create: String // 创建时间
  }],
  gmt_create: String, // 创建时间
  gmt_modified: String, // 最后修改时间
},{versionKey: false})

module.exports = commentSchema;