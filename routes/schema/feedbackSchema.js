const mongoose = require('mongoose');

let feedbackSchema = new mongoose.Schema({
  suggestion: String,
  phone: String,
  gmt_create: String,
},{versionKey: false})

module.exports = feedbackSchema;