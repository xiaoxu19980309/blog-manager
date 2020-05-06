const mongoose = require('mongoose');
const Schema = mongoose.Schema
var objectId = require('mongodb').ObjectId;
var commentSchema = require('./commentSchema')
mongoose.set('useFindAndModify', false)

let issuesSchema = new mongoose.Schema({
  userId: {type: Schema.Types.ObjectId,ref: 'users'}, // 用户ID
  title: String, // 标题
  content: String, // 内容
  content_text: String, // 文本内容
  commentList: [{
    type: Schema.Types.ObjectId, ref: 'comments' // 评论列表
  }],
  likesList: [{
    type: Schema.Types.ObjectId, ref: 'likes' // 喜欢列表
  }],
  subjectName: String, // 专题名
  subjectId: String, // 专题ID
  isResend: Boolean, // 是否是转载
  likesCount: Number, // 喜欢数量
  commentsCount: Number, // 评论数量
  noReprint: Boolean, // 禁止转载
  gmt_create: String, // 创建时间
  gmt_modified: String // 最后修改时间
},{versionKey: false})

module.exports = issuesSchema;