var getTime = require('../../utils/time');
var app = require("express").Router()
var objectId = require('mongodb').ObjectId;
const getSession = require('../../utils/session')
const userModel = require('../models/userModel')
const issuesModel = require('../models/issuesModel')
const subjectModel = require('../models/subjectModel')

// 新建专题
app.post('/createSubject', (req, res) => {
  var userId = req.body.userId
  var name = req.body.name
  var photo = req.body.photo
  var description = req.body.description
  new Promise((resolve, reject)=>{
    subjectModel.create([{userId: objectId(userId),name: name,photo: photo, description: description,
      articleList: [],fansList: [],gmt_create: getTime(),gmt_modified: getTime()}]).then(res => {
      resolve(res)
    }).catch(e => {
      reject(e)
    })
  }).then(doc => {
    if(doc) {
      res.send({status: 200,msg: '新建专题成功！'})
    }else{
      res.send({status: 500,msg: '新建失败！'})
    }
  })
})

//获取专题列表
app.post('/getSubjects', (req, res) => {
  var userId = req.body.userId
  new Promise((resolve, reject)=>{
    subjectModel.find({userId: objectId(userId)}).then(res => {
      resolve(res)
    }).catch(e => {
      reject(e)
    })
  }).then(doc => {
    if(doc) {
      res.send({status: 200,msg: '获取专题列表成功！',data: doc})
    }else{
      res.send({status: 500,msg: '获取失败！'})
    }
  })
})

//获取推荐专题列表
app.post('/getRecommondSubjects', (req, res) => {
  var userId = req.body.userId
  var limit = req.body.limit? req.body.limit: 10
  var page = req.body.page? req.body.page: 1
  new Promise((resolve, reject)=>{
    subjectModel.find({userId: {$ne: objectId(userId)}}).sort({gmt_modified: -1}).limit(parseInt(limit)).skip((page-1)*limit).then(res => {
      resolve(res)
    }).catch(e => {
      reject(e)
    })
  }).then(doc => {
    if(doc) {
      res.send({status: 200,msg: '获取专题列表成功！',data: doc})
    }else{
      res.send({status: 500,msg: '获取失败！'})
    }
  })
})

module.exports = app
