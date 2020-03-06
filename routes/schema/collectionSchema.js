const mongoose = require('mongoose');
var objectId = require('mongodb').ObjectId;
var articleModel = require('../models/articleModel')
var Schema = mongoose.Schema

let collectionSchema = new mongoose.Schema({
  userId: objectId,
  name: String,
  gmt_create: String,
  gmt_modified: String,
  articleList: [{type: Schema.Types.ObjectId,ref: 'articles'}]
},{versionKey: false})

module.exports = collectionSchema;