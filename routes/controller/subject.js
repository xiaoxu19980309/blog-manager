var getTime = require('../../utils/time');
var app = require("express").Router()
var objectId = require('mongodb').ObjectId;
const getSession = require('../../utils/session')
const userModel = require('../models/userModel')
const issuesModel = require('../models/issuesModel')
const subjectModel = require('../models/subjectModel')
const contributionModel = require('../models/contributionModel')

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

//关注专题
app.post('/focusSubject', (req, res) => {
  var userId = req.body.userId
  var id = req.body.subjectId
  new Promise((resolve, reject)=>{
    subjectModel.updateOne({_id: objectId(id)},{$push: {fansList: objectId(userId)},$set: {gmt_modified:getTime()}}).then(res => {
      resolve(res)
    }).catch(e => {
      reject(e)
    })
  }).then(doc => {
    if(doc.nModified === 1) {
      res.send({status: 200,msg: '关注专题成功！'})
    }else{
      res.send({status: 500,msg: '关注专题失败！'})
    }
  })
})

//取消关注专题
app.post('/cancelFocusSubject', (req, res) => {
  var userId = req.body.userId
  var id = req.body.subjectId
  new Promise((resolve, reject)=>{
    subjectModel.updateOne({_id: objectId(id)},{$pull: {fansList: objectId(userId)},$set: {gmt_modified:getTime()}}).then(res => {
      resolve(res)
    }).catch(e => {
      reject(e)
    })
  }).then(doc => {
    if(doc.nModified === 1) {
      res.send({status: 200,msg: '取消关注专题成功！'})
    }else{
      res.send({status: 500,msg: '取消关注专题失败！'})
    }
  })
})

//管理员获取专题列表
app.post('/getSubjectList', (req, res) => {
  var name = req.body.name
  var limit = req.body.limit?req.body.limit:10
  var page = req.body.page?req.body.page:1
  let reg = new RegExp(name, 'i')
  new Promise((resolve, reject)=>{
    subjectModel.find({$or: [{name: {$regex: reg}}]}).populate('userId').limit(parseInt(limit)).skip((page-1)*limit).then(res => {
      resolve(res)
    }).catch(e => {
      reject(e)
    })
  }).then(doc => {
    if(doc) {
      subjectModel.find({}).count((err,num)=>{
        if(err) res.send({status: 500,msg: '获取失败！'})
        res.send({status: 200,msg: '获取专题列表成功！',data: doc,count:num})
      })
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

//专题投稿
app.post('/contributeSubject',(req,res) => {
  var subjectId = req.body.subjectId
  var userId = req.body.userId
  var articleId = req.body.articleId
  new Promise((resolve,reject)=>{
    contributionModel.create([{userId: objectId(userId),articleId: objectId(articleId),isChecked: false,isPassed: false,
      subjectId: objectId(subjectId),gmt_create: getTime(),gmt_modified: getTime()}]).then(res => {
        resolve(res)
    }).catch(err => {
      reject(err)
    })
  }).then((result)=>{
    if(result){
      res.send({status: 200,msg: '投稿成功，请耐心等待审核~'})
    }else{
      res.send({status:500,msg:'投稿失败!'})
    }
  }).catch(e => {
    console.log(e)
  })
})

// 专题投稿审核
app.post('/contributeCheck',(req,res) => {
  var id = req.body.id
  var isPassed = req.body.isPassed
  var subjectId = req.body.subjectId
  getSession().then((session)=>{
    new Promise((resolve,reject)=>{
      contributionModel.updateOne({_id: objectId(id)},{$set: {gmt_modified: getTime(),isChecked: true,isPassed: isPassed}}
      ,{session},function(err,result){
        if(err) reject(err)
        resolve(result)
      })
    }).then((result)=>{
      if(isPassed == true && result.nModified === 1){
        subjectModel.updateOne({_id: objectId(subjectId)},{$push: {articleList: objectId(articleId)},$set: {gmt_modified: getTime()}}
        ,{session},function(err,result2){
          if(err) session.abortTransaction()
          if(result2.nModified === 1){
            session.commitTransaction().then(()=>{
              session.endSession();
            })
            res.send({status:200,msg:'审核成功！'});
          }else {
            res.send({status:500,msg:'审核失败!'})
          }
        })
      }
      if(result){
        res.send({status: 200,msg: '投稿成功，请耐心等待审核~'})
      }else{
        res.send({status:500,msg:'投稿失败!'})
      }
    }).catch(e => {
      console.log(e)
    })
  })
})

//获取审核列表
app.post('/getContributions',(req,res) => {
  var userId = req.body.userId
  new Promise((resolve,reject)=>{
    contributionModel.find({userId: objectId(userId),isChecked: false}).exec(function(err,result){
      if(err) reject(err)
      resolve(result)
    })
  }).then((result)=>{
    if(result){
      res.send({status: 200,msg: '获取成功！',data: result})
    }else{
      res.send({status:500,msg:'获取失败!'})
    }
  }).catch(e => {
    console.log(e)
  })
})

// 删除专题
app.post('/deleteSubject',(req,res) => {
  var id = req.body.id
  getSession().then((session) => {
    new Promise((resolve,reject)=>{
      subjectModel.deleteOne({_id: objectId(id)},{session},function(err,result){
        if(err) reject(err)
        resolve(result)
      })
    }).then((result)=>{
      return new Promise((resolve,reject)=>{

      })
    }).catch(e => {

    })
  }).catch(err => {

  })
})

module.exports = app
