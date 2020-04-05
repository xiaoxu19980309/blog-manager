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
    if(doc){
      res.send({status: 200,msg: '新建专题成功！'})
    }else{
      res.send({status: 500,msg: '新建失败！'})
    }
  }).catch(e => {
    console.log(e)
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
  getSession().then((session)=>{
    new Promise((resolve, reject)=>{
      subjectModel.updateOne({_id: objectId(id)},{$push: {fansList: objectId(userId)},$set: {gmt_modified:getTime()}},{session}).then(res => {
        resolve(res)
      }).catch(e => {
        reject(e)
      })
    }).then(doc => {
      if(doc.nModified === 1) {
        userModel.updateOne({_id: objectId(userId)},{$push: {focusSubject: objectId(id)},$set: {gmt_modified: getTime()}},{session},function(err,result2){
          if(err) session.abortTransaction()
          if(result2.nModified === 1) {
            session.commitTransaction().then(()=>{
              session.endSession();
            })
            res.send({status: 200,msg: '关注专题成功！'})
          }else{
            res.send({status: 500,msg: '关注专题失败！'})
          }
        })
      }else{
        res.send({status: 500,msg: '关注专题失败！'})
      }
    })
  })
  
})

//取消关注专题
app.post('/cancelFocusSubject', (req, res) => {
  var userId = req.body.userId
  var id = req.body.subjectId
  getSession().then((session)=>{
    new Promise((resolve, reject)=>{
      subjectModel.updateOne({_id: objectId(id)},{$pull: {fansList: objectId(userId)},$set: {gmt_modified:getTime()}},{session}).then(res => {
        resolve(res)
      }).catch(e => {
        reject(e)
      })
    }).then(doc => {
      if(doc.nModified === 1) {
        userModel.updateOne({_id: objectId(userId)},{$pull: {focusSubject: objectId(id)}},{session},function(err,result2){
          if(err) session.abortTransaction()
          if(result2.nModified === 1) {
            session.commitTransaction().then(()=>{
              session.endSession()
            })
            res.send({status: 200,msg: '取消关注专题成功！'})
          }else {
            res.send({status: 500,msg: '取消关注专题失败！'})
          }
        })
      }else{
        res.send({status: 500,msg: '取消关注专题失败！'})
      }
    })
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
      subjectModel.find({}).estimatedDocumentCount((err,num)=>{
        if(err) res.send({status: 500,msg: '获取失败！'})
        res.send({status: 200,msg: '获取专题列表成功！',data: doc,count:num})
      })
    }else{
      res.send({status: 500,msg: '获取失败！'})
    }
  })
})

//管理员删除专题下文章
app.post('/deleteSubArticle', (req, res) => {
  var articleId = req.body.articleId
  var subjectId = req.body.subjectId
  new Promise((resolve, reject)=>{
    subjectModel.updateOne({_id: objectId(subjectId)},{$pull: {articleList: objectId(articleId)},$set: {gmt_modified: getTime()}}).then(res => {
      resolve(res)
    }).catch(e => {
      reject(e)
    })
  }).then(doc => {
    if(doc.nModified === 1) {
      res.send({status: 200,msg: '删除成功！'})
    }else{
      res.send({status: 500,msg: '删除失败！'})
    }
  })
})

//管理员获取专题文章列表
app.post('/getSubjectArticleList', (req, res) => {
  var name = req.body.name
  var title = req.body.title
  var limit = req.body.limit?req.body.limit:10
  var page = req.body.page?req.body.page:1
  let reg = new RegExp(name, 'i')
  let regt = new RegExp(title,'i')
  new Promise((resolve, reject)=>{
    subjectModel.find({$or: [{name: {$regex: reg}}]}).populate({path: 'articleList',match: {$or: [{title: {$regex: regt}}]},populate: {path: 'userId',select: 'nickname photo'}}).then(res => {
      resolve(res)
    }).catch(e => {
      reject(e)
    })
  }).then(doc => {
    if(doc) {
      let count = 0
      let result = []
      doc.forEach(element => {
        if(element.articleList.length != 0) {
          count += element.articleList.length
          element.articleList.forEach(ele => {
            ele.subjectName = element.name
            ele.subjectId = element._id
          })
          result = result.concat(element.articleList)
        }
      });
      let ans = result.slice((page-1)*limit,limit)
      res.send({status: 200,msg: '获取专题文章列表成功！',data: ans,count:count})
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
    contributionModel.findOne({userId: objectId(userId),articleId: objectId(articleId)},function(err,result){
      if(err) reject(err)
      resolve(result)
    })
  }).then((result)=>{
    if(result&&!result.isChecked){
      res.send({status: 200,msg: '已投稿，请耐心等待审核~'})
    }else{
      contributionModel.create([{userId: objectId(userId),articleId: objectId(articleId),isChecked: false,isPassed: false,
        subjectId: objectId(subjectId),gmt_create: getTime(),gmt_modified: getTime()}]).then(result2 => {
          if(result2) {
            res.send({status: 200,msg: '投稿成功，请耐心等待审核~'})
          }else{
            res.send({status:500,msg:'投稿失败!'})
          }
      }).catch(err => {
        console.log(err)
      })
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
  var articleId = req.body.articleId
  getSession().then((session)=>{
    new Promise((resolve,reject)=>{
      contributionModel.updateOne({_id: objectId(id)},{$set: {gmt_modified: getTime(),isChecked: true,isPassed: isPassed}}
      ,{session},function(err,result){
        if(err) reject(err)
        resolve(result)
      })
    }).then((result)=>{
      if(isPassed == 'true' && result.nModified === 1){
        subjectModel.updateOne({_id: objectId(subjectId)},{$push: {articleList: objectId(articleId)},$set: {gmt_modified: getTime()}}
        ,{session},function(err,result2){
          if(err) session.abortTransaction()
          console.log(result2)
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
    }).catch(e => {
      console.log(e)
    })
  })
})

//获取审核列表
app.post('/getContributions',(req,res) => {
  var userId = req.body.userId
  new Promise((resolve,reject)=>{
    contributionModel.find({isChecked: false}).populate({path: 'subjectId',match: {'userId': objectId(userId)}})
    .populate('articleId')
    .populate('userId','nickname photo').exec(function(err,result){
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

//获取审核结果列表
app.post('/getContributionBack',(req,res) => {
  var userId = req.body.userId
  new Promise((resolve,reject)=>{
    contributionModel.find({userId: objectId(userId), isChecked: true}).populate({path: 'subjectId'})
    .populate('articleId')
    .populate('userId','nickname photo').exec(function(err,result){
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
  var userId = req.body.userId
  getSession().then((session) => {
    new Promise((resolve,reject)=>{
      subjectModel.deleteOne({_id: objectId(id)},{session},function(err,result){
        if(err) reject(err)
        resolve(result)
      })
    }).then((result)=>{
      userModel.updateOne({_id: objectId(userId)},{$pull: {focusSubject: objectId(id)},$set: {gmt_modified: getTime()}},{session},function(err,result2){
        if(err) session.abortTransaction()
        if(result2.nModified === 1) {
          session.commitTransaction().then(()=>{
            session.endSession();
          })
          res.send({status: 200,msg: '删除成功！',data: result})
        }else{
          res.send({status: 200,msg: '删除失败！'})
        }
      })
    }).catch(e => {

    })
  }).catch(err => {

  })
})

module.exports = app
