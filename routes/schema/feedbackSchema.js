const mongoose = require('mongoose');

let feedbackSchema = new mongoose.Schema({
  suggestion: String, // 建议
  phone: String, // 手机号
  gmt_create: String, //创建时间
},{versionKey: false})

module.exports = feedbackSchema;