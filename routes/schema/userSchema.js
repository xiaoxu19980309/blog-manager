const mongoose = require('mongoose');
const Schema = mongoose.Schema

let userSchema = new mongoose.Schema({
  username: String, // 用户名
  password: String, // 密码
  isadmin: Boolean, // 是否是管理员
  nickname: String, // 昵称
  description: String, // 简介
  net: String, // 个人网站
  sex: Number, // 性别
  phone: String, // 手机号
  photo: String, // 头像
  articleList: [{type: Schema.Types.ObjectId, ref: 'issues'}], // 文章列表
  focusList: [{type: Schema.Types.ObjectId, ref: 'users'}], // 关注列表
  focusSubject: [{type: Schema.Types.ObjectId, ref: 'subjects'}], // 关注专题列表
  fansList: [{type:Schema.Types.ObjectId, ref: 'users'}], // 粉丝列表
  gmt_create: String, // 创建时间
  gmt_modified: String, // 最后修改时间
},{versionKey: false})

module.exports = userSchema