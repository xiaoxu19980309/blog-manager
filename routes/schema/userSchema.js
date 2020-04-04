const mongoose = require('mongoose');
const Schema = mongoose.Schema

let userSchema = new mongoose.Schema({
  username: String,
  password: String,
  isadmin: Boolean,
  nickname: String,
  description: String,
  net: String,
  sex: Number,
  phone: String,
  photo: String,
  articleList: [{type: Schema.Types.ObjectId, ref: 'issues'}],
  focusList: [{type: Schema.Types.ObjectId, ref: 'users'}],
  focusSubject: [{type: Schema.Types.ObjectId, ref: 'subjects'}],
  fansList: [{type:Schema.Types.ObjectId, ref: 'users'}],
  gmt_create: String,
  gmt_modified: String,
},{versionKey: false})

module.exports = userSchema