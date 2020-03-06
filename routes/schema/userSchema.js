const mongoose = require('mongoose');

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
  gmt_create: String,
  gmt_modified: String,
},{versionKey: false})

module.exports = userSchema