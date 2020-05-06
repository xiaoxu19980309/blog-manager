const mongoose = require('mongoose');
var objectId = require('mongodb').ObjectId;
var articleModel = require('../models/articleModel')
var Schema = mongoose.Schema

let collectionSchema = new mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'users'}, // 作者ID
  name: String, // 文集名
  gmt_create: String, // 创建时间
  gmt_modified: String, // 最后修改时间
  articleList: [{type: Schema.Types.ObjectId,ref: 'articles'}] // 文章列表
},{versionKey: false})

module.exports = collectionSchema;