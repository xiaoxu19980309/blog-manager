var getTime = require('../../utils/time');
var app = require("express").Router()
var objectId = require('mongodb').ObjectId;
const getSession = require('../../utils/session')
const userModel = require('../models/userModel')
const issuesModel = require('../models/issuesModel')
const LikeModel = require('../models/likesModel')
const storeModel = require('../models/storeModel')

// 喜欢文章
app.post('/insertLikes',(req,res) => {
  var userId = req.body.userId
  var articleId = req.body.articleId
  var status = req.body.status
  getSession().then((session) => {
    new Promise((resolve, reject) => {
      LikeModel.create([{articleId: objectId(articleId),userId: objectId(userId),status: Number(status),
        gmt_create: getTime(), gmt_modified: getTime()}],{session}).then(res => {
          resolve(res)
        }).catch(e => {
          reject(e)
      })
    }).then(result => {
      issuesModel.updateOne({_id: objectId(articleId)},{$push: {likesList: result[0]._id},
      $set: {gmt_modified: getTime()}},{session},function(err,doc){
        if(err) session.abortTransaction()
        if(doc.nModified === 1){
          session.commitTransaction().then(()=>{
            session.endSession();
          })
          res.send({status:200,msg:'操作成功！'});
        }else {
          res.send({status:500,msg:'操作失败!'})
        }
      })
    }).catch((err) => {
      console.log(err);
      res.send({status:500,msg:'操作失败!'})
    })
  })
});

// 获取喜欢状态
app.post('/getLikes',(req,res) => {
  var userId = req.body.userId
  var articleId = req.body.articleId
  new Promise((resolve, reject) => {
      LikeModel.findOne({articleId: objectId(articleId),userId: objectId(userId)},function(err,result){
        if(err) reject(err)
        resolve(result)
      })
  }).then((result) => {
    res.send({status:200,msg:'查找成功！', data: result});
  }).catch((err) => {
      console.log(err);
      res.send({status:500,msg:'查找失败!'})
  })
});

//获取收到喜欢列表
app.post('/getLikedList',(req,res) => {
  var userId = req.body.userId
  new Promise((resolve, reject) => {
    issuesModel.find({userId: objectId(userId)}).populate({path: 'likesList',match: {status: 1},populate:{path: 'userId', select: 'nickname photo'}}).exec(function(err,result){
      if(err) reject(err)
      resolve(result)
    })
  }).then((result) => {
    var doc = []
    result.forEach(element => {
      if(element.likesList.length!=0){
        doc = doc.concat(element)
      }
    });
    res.send({status:200,msg:'查找成功！', data: doc});
  }).catch((err) => {
      console.log(err);
      res.send({status:500,msg:'查找失败!'})
  })
});

// 更新喜欢文章状态
app.post('/updateLikes',(req,res) => {
  var userId = req.body.userId
  var articleId = req.body.articleId
  var status = req.body.status
  getSession().then((session) => {
    new Promise((resolve, reject) => {
      LikeModel.findOneAndUpdate({userId: objectId(userId),articleId: objectId(articleId)},{$set:{status: Number(status),gmt_modified: getTime()}},{session},function(err,result){
        if(err) reject(err)
        resolve(result)
      })
    }).then((result) => {
      if(status == 2 || status == 0){
        issuesModel.updateOne({_id: objectId(articleId)},{$pull: {likesList: result._id},
          $set: {gmt_modified: getTime()}},{session},function(err,doc){
            if(err) session.abortTransaction()
            if(doc.nModified === 1){
              session.commitTransaction().then(()=>{
                session.endSession();
              })
              res.send({status:200,msg:'更新成功！'});
            } else {
              res.send({status:500,msg:'更新失败!'})
            }
        })
      } else {
        issuesModel.updateOne({_id: objectId(articleId)},{$push: {likesList: result._id},
          $set: {gmt_modified: getTime()}},{session},function(err,doc){
            if(err) session.abortTransaction()
            if(doc.nModified === 1){
              session.commitTransaction().then(()=>{
                session.endSession();
              })
              res.send({status:200,msg:'更新成功！'});
            } else {
              res.send({status:500,msg:'更新失败!'})
            }
        })
      }
    }).catch((err) => {
        console.log(err);
        res.send({status:500,msg:'更新失败!'})
    })
  }).catch(e => {

  })
});

// 获取喜欢文章的人数
app.post('/getLikeCount',(req,res) => {
  var articleId = req.body.articleId
  new Promise((resolve,reject) => {
    issuesModel.findOne({_id: objectId(articleId)},function(err,doc){
      if(err) reject(err)
      resolve(doc)
    }).then(result => {
      res.send({status:200,msg:'统计成功！',data: result.likesList.length})
    }).catch(err => {
      res.send({status:200,msg:'统计失败！'})
    })
  })
})

// 收藏文章
app.post('/insertCollect',(req,res) => {
  var userId = req.body.userId
  var articleId = req.body.articleId
  new Promise((resolve, reject) => {
      storeModel.create({articleId: objectId(articleId),userId: objectId(userId),gmt_create: getTime(), gmt_modified: getTime()}).then(res => {
        resolve(res)
      }).catch(e => {
        reject(e)
      })
  }).then((result) => {
      if(result){
        res.send({status:200,msg:'收藏成功！'});
      }else{
        res.send({status:500,msg:'收藏失败!'})
      }
  }).catch((err) => {
      console.log(err);
      res.send({status:500,msg:'收藏失败!'})
  })
});

// 获取收藏文章列表
app.post('/getStores',(req,res) => {
  var userId = req.body.userId
  var limit = req.body.limit? req.body.limit : 10
  var page = req.body.page? req.body.page : 1
  new Promise((resolve, reject) => {
      storeModel.find({userId: objectId(userId)}).populate('userId','nickname photo ').populate('articleId','content_text title gmt_create commentList likesList')
      .limit(parseInt(limit)).skip((page-1)*limit)
      .exec((err,doc) => {
        if(err) reject(err)
        resolve(doc);
      })
  }).then((result) => {
    if(result){
      result.forEach(element => {
        element.articleId.likesCount = element.articleId.likesList.length
        element.articleId.commentsCount = element.articleId.commentList.length
        element.articleId.likesList = []
        element.articleId.commentList = []
      })
      res.send({status:200,msg:'获取成功！',data: result});
    }else{
      res.send({status:500,msg:'获取失败!'})
    }
  }).catch((err) => {
      console.log(err);
      res.send({status:500,msg:'查找失败!'})
  })
});

//  取消收藏
app.post('/deleteStore',(req,res) => {
  var id = req.body.id
  new Promise((resolve, reject) => {
    storeModel.remove({_id: objectId(id)},function(err,res){
      if(err) reject(err)
      resolve(res)
    })
  }).then((result) => {
    if(result.ok === 1){
      res.send({status:200,msg:'取消成功！'});
    }else{
      res.send({status:500,msg:'取消失败!'})
    }
  }).catch((err) => {
    console.log(err);
    res.send({status:500,msg:'取消失败!'})
  })
});

//获取统计数据
app.post('/staticNum',(req,res) => {
  var id = req.body.userId
  var param = {
    textCount: 0, // 文字数
    likeCount: 0,  // 收到的喜欢
    number: 0, // 文章数
    focusCount: 0,
    fansCount: 0
  }
  new Promise((resolve,reject)=>{
    userModel.findOne({_id: objectId(id)}).populate('articleList').exec(function(err,doc){
      if(err) reject(err)
      resolve(doc)
    })
  }).then(result => {
    if(result){
      param.number = result.articleList.length
      result.articleList.forEach(element => {
        param.textCount += element.content_text.length
        param.likeCount += element.likesList.length
      });
      param.fansCount = result.fansList.length
      param.focusCount = result.focusList.length
      res.send({status:200,msg:'获取成功！',data: param})
    }else{
      res.send({status:200,msg:'获取失败！'})
    }
  }).catch(err => {
    console.log(err)
  })
})

// 获取喜欢文章列表
app.post('/getLikeList',(req,res) => {
  var userId = req.body.userId
  var type = req.body.type
  var limit = req.body.limit? req.body.limit : 10
  var page = req.body.page? req.body.page : 1
  new Promise((resolve, reject) => {
      LikeModel.find({userId: objectId(userId)}).populate('userId','nickname photo ').populate('articleId','content_text title gmt_create commentList likesList')
      .limit(parseInt(limit)).skip((page-1)*limit)
      .exec((err,doc) => {
        if(err) reject(err)
        resolve(doc);
      })
  }).then((result) => {
    if(result){
      result.forEach(element => {
        element.articleId.likesCount = element.articleId.likesList.length
        element.articleId.commentsCount = element.articleId.commentList.length
        element.articleId.likesList = []
        element.articleId.commentList = []
      })
      res.send({status:200,msg:'获取成功！',data: result});
    }else{
      res.send({status:500,msg:'获取失败!'})
    }
  }).catch((err) => {
      console.log(err);
      res.send({status:500,msg:'查找失败!'})
  })
});

//删除已发布的文章
app.post('/deleteIssues',(req,res) => {
  var id = req.body.id
  var userId = req.body.userId
  getSession().then((session) => {
    issuesModel.deleteOne({_id: objectId(id)},{session},function(err,result){
      if(err) session.abortTransaction()
      userModel.updateOne({_id: objectId(userId)},{$pull: {articleList: objectId(id)},$set: {gmt_modified: getTime()}},{session},function(err,result2){
        if(err) {
          session.abortTransaction()
          res.send({status:500,msg:"删除失败！"})
        }
        if(result2.nModified === 1){
          session.commitTransaction().then(()=>{
            session.endSession();
          })
          res.send({status:200,msg:'删除成功！'});
        }else{
          session.abortTransaction()
          res.send({status:500,msg:"删除失败！"})
        }
      })
    })
  }).catch(e => {
    console.log(e)
  })
});

// 搜索所有文章标题
app.post('/getIssuesByTitle',(req,res) => {
  var page = req.body.page?req.body.page:1
  var limit = req.body.limit?req.body.limit:10
  var title = req.body.title
  let reg = new RegExp(title, 'i')
  new Promise((resolve, reject) => {
    issuesModel.find({$or: [{title: {$regex: reg}}]}).populate('userId','nickname photo').limit(parseInt(limit)).skip((page-1)*limit).then(result => {
      resolve(result);
    }).catch(e => {
      reject(e)
    })
  }).then((result) => {
    if(result.length!=0){
      issuesModel.find({}).estimatedDocumentCount(function(err,num){
        if(err) res.send({status:200,msg:'查询失败！'});
        if(num) {
          res.send({status:200,msg:'查询成功',data: result,count: num});
        }
      })
    }else if(result.length == 0){
        res.send({status:200,msg:'没有结果！',count: 0});
    }
  }).catch((err) => {
      res.send({status:500,msg:'查询失败！',count: 0});
  })
});

// 搜索私人文章标题
app.post('/getPersonIssueTitle',(req,res) => {
  var page = req.body.page?req.body.page:1
  var limit = req.body.limit?req.body.limit:10
  var title = req.body.title
  var userId = req.body.userId
  let reg = new RegExp(title, 'i')
  new Promise((resolve, reject) => {
    issuesModel.find({$or: [{title: {$regex: reg},userId: objectId(userId)}]}).populate('userId','nickname photo').limit(parseInt(limit)).skip((page-1)*limit).then(result => {
      resolve(result);
    }).catch(e => {
      reject(e)
    })
  }).then((result) => {
    if(result.length!=0){
      issuesModel.find({}).estimatedDocumentCount(function(err,num){
        if(err) res.send({status:200,msg:'查询失败！'});
        if(num) {
          res.send({status:200,msg:'查询成功',data: result,count: num});
        }
      })
    }else if(result.length == 0){
        res.send({status:200,msg:'没有结果！',count: 0});
    }
  }).catch((err) => {
      res.send({status:500,msg:'查询失败！',count: 0});
  })
});

module.exports = app;