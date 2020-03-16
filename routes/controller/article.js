const JwtUtil = require('../../utils/jwt');
var getTime = require('../../utils/time');
var app = require("express").Router()
const collectionModel = require('../models/collectionModel')
const articleModel = require('../models/articleModel')
const issuesModel = require('../models/issuesModel')
const commentModel = require('../models/commentsModel')
const getSession = require('../../utils/session')
var objectId = require('mongodb').ObjectId;

// 新建文集
app.post('/insertCollection',(req,res) => {
  var collectionName = req.body.name
  let token = req.headers.token;
  let jwt = new JwtUtil(token);
  let userId = jwt.verifyToken();
  new Promise((resolve, reject) => {
      collectionModel.create({userId: objectId(userId),name: collectionName,gmt_create: getTime(),gmt_modified: getTime(),
        articleList: []}).then(res => {
          resolve(res)
      }).catch(e => {
        reject(e)
      })
  }).then((result) => {
      if(result){
        res.send({status:200,msg:'新建成功！',data: result});
      }else{
        res.send({status:500,msg:'新建文集失败!'})
      }
  }).catch((err) => {
      console.log(err);
      res.send({status:500,msg:'新建文集失败!'})
  })
});

// 获取文集列表
app.post('/getCollections',(req,res) => {
  let token = req.headers.token;
  let jwt = new JwtUtil(token);
  let userId = jwt.verifyToken();
  new Promise((resolve, reject) => {
    collectionModel.find({userId: objectId(userId)}).populate({path: 'articleList', match: {'articleList.$.has_publish': false}}).exec(function(err,result){
      if(err) reject(err)
      resolve(result)
    })
  }).then((result) => {
    if(result){
      res.send({status:200,msg:'获取成功！',data: result});
    }else{
      res.send({status:500,msg:'获取失败!'})
    }
  }).catch((err) => {
      console.log(err);
      res.send({status:500,msg:'获取失败!'})
  })
});

// 修改文集
app.post('/editCollection',(req,res) => {
  var collectionName = req.body.name
  var collectionId = req.body.collectionId
  new Promise((resolve, reject) => {
      collectionModel.updateOne({_id: objectId(collectionId)},{$set:{name: collectionName,gmt_modified: getTime()}},function(err,result){
        if(err) reject(err)
        resolve(result)
      })
  }).then((result) => {
      if(result.nModified === 1){
        res.send({status:200,msg:'修改成功！'});
      }else{
        res.send({status:500,msg:'修改文集失败!'})
      }
  }).catch((err) => {
      console.log(err);
      res.send({status:500,msg:'修改文集失败!'})
  })
});

// 删除文集
app.post('/deleteCollection',(req,res) => {
  var collectionId = req.body.collectionId
  getSession().then((session)=>{
    new Promise((resolve, reject) => {
      collectionModel.deleteOne({_id: objectId(collectionId)},{session},function(err, result){
        if(err) reject(err)
        resolve(result);
      })
    }).then((result) => {
      return new Promise((resovle,reject) => {
        articleModel.deleteMany({collectionId: collectionId},{session},function(err,res){
          if(err) session.abortTransaction()
          resovle(res)
        })
      })
    }).then((result) => {
      if(result.ok === 1){
        session.commitTransaction().then(()=>{
          session.endSession()
        }).catch(e => {})
        res.send({status:200,msg:'删除成功！'});
      }else{
        session.abortTransaction()
        res.send({status:500,msg:'删除文集失败!'})
      }
    }).catch((err) => {
        console.log(err);
        res.send({status:500,msg:'删除文集失败!'})
    })
  }).catch(e => {
    console.log(e)
  })
});

// 新建文章
app.post('/insertArticle',(req,res) => {
  var collectionId = req.body.collectionId
  var title = req.body.title
  var content = req.body.content
  getSession().then((session)=>{
    new Promise((resolve, reject) => {
      articleModel.create([{collectionId: objectId(collectionId),title: title,content: content, has_publish: false,
        noReprint: false, gmt_create: getTime(), gmt_modified: getTime()}],{session}).then(res => {
          resolve(res)
        }).catch(e => {
          reject(e)
      })
    }).then((result)=>{
      return new Promise((resolve,reject) => {
        collectionModel.updateOne({_id: objectId(collectionId)},{$push: {articleList: result[0]._id},$set: {gmt_modified: getTime()}},{session},function(err,res){
          if(err) session.abortTransaction()
          resolve(res)
        })
      })
    }).then((result) => {
        if(result.nModified === 1){
          session.commitTransaction().then(()=>{
            session.endSession()
          }).catch(e => {

          })
          res.send({status:200,msg:'新建成功！'});
        }else{
          session.abortTransaction()
          res.send({status:500,msg:'新建文章失败!'})
        }
    }).catch((err) => {
        console.log(err);
        res.send({status:500,msg:'新建文章失败!'})
    })
  }).catch(e => {
    console.log(e)
  })
});

// 修改文章
app.post('/updateArticle',(req,res) => {
  var articleId = req.body.articleId
  var title = req.body.title
  var content = req.body.content
  var noReprint = req.body.no_reprint
  new Promise((resolve, reject) => {
      if (title&&content) {
        articleModel.updateOne({_id: objectId(articleId)},{$set:{title: title, content: content, gmt_modified: getTime()}},function(err,result){
          if(err) reject(err)
          resolve(result);
        })
      } else if (!title&&content) {
        articleModel.updateOne({_id: objectId(articleId)},{$set:{content: content, gmt_modified: getTime()}},function(err,result){
          if(err) reject(err)
          resolve(result);
        })
      } else if(title&&!content){
        articleModel.updateOne({_id: objectId(articleId)},{$set:{title: title, gmt_modified: getTime()}},function(err,result){
          if(err) reject(err)
          resolve(result);
        })
      }
      if(noReprint) {
        articleModel.updateOne({_id: objectId(articleId)},{$set:{noReprint: noReprint, gmt_modified: getTime()}},function(err,result){
          if(err) reject(err)
          resolve(result);
        })
      }
  }).then((result) => {
    if(result.nModified === 1){
      res.send({status:200,msg:'修改成功！'});
    }else{
      res.send({status:500,msg:'修改失败!'})
    }
  }).catch((err) => {
      console.log(err);
      res.send({status:500,msg:'修改文章失败!'})
  })
});

// 删除文章
app.post('/deleteArticle',(req,res) => {
  var id = req.body.id
  var collectionId = req.body.collectionId
  getSession().then((session) => {
    articleModel.deleteOne({_id: objectId(id)},{session},function(err,result){
      if(err) session.abortTransaction()
      collectionModel.updateOne({_id: objectId(collectionId)},{$pull: {articleList:  objectId(id)}},{session},function(err,result2){
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

// 发布文章
app.post('/insertIssue',(req,res) => {
  let token = req.headers.token;
  let jwt = new JwtUtil(token);
  let userId = jwt.verifyToken();
  var id = req.body.articleId
  var title = req.body.title
  var content = req.body.content
  var content_text = req.body.content_text
  getSession().then((session) => {
    new Promise((resolve, reject) => {
      issuesModel.create([{userId: objectId(userId),title: title,content: content,content_text:content_text, noReprint: false, gmt_create: getTime(), 
        gmt_modified: getTime()}],{session}).then(res => {
        resolve(res);
      }).catch(e => {
        reject(e)
      })
    }).then(() => {
      return new Promise((resolve, reject) => {
        articleModel.updateOne({_id: objectId(id)},{$set: {has_publish: true, gmt_modified: getTime()}},{session},function(err,result){
          if(err) session.abortTransaction()
          resolve(result);
        })
      })
    }).then((result) => {
      if(result.nModified === 1){
        session.commitTransaction().then(()=>{
          session.endSession()
        }).catch(e => {})
        res.send({status:200,msg:'发布成功！'});
      }else{
        session.abortTransaction()
        res.send({status:500,msg:'发布文章失败!'})
      }
    }).catch((err) => {
        console.log(err);
        res.send({status:500,msg:'发布文章失败!'})
    })
  }).catch(e => {
    console.log(e)
  })
});

// 获取个人主页
app.post('/getHomePage',(req,res) => {
  let userId = req.body.userId
  var limit = req.body.limit? req.body.limit: 10
  var page = req.body.page? req.body.page: 1
  new Promise((resolve, reject) => {
    issuesModel.find({userId: objectId(userId)}).limit(parseInt(limit)).skip((page-1)*limit).then(res => {
      resolve(res);
    }).catch(e => {
      reject(e)
    })
  }).then((result) => {
    if(result){
      res.send({status:200,msg:'获取成功！',data: result});
    }else{
      res.send({status:500,msg:'获取失败!'})
    }
  }).catch((err) => {
      console.log(err);
      res.send({status:500,msg:'获取失败!'})
  })
});

//获取文章内容
app.post('/getArticle',(req,res) => {
  let articleId = req.body.articleId
  new Promise((resolve, reject) => {
    issuesModel.findOne({_id: objectId(articleId)}).populate('userId','nickname photo')
    .populate({path: 'commentList',populate: {path: 'userId replyList.userId',select: 'nickname photo'}})
    .exec(function(err,doc){
      if(err) reject(err)
      resolve(doc)
    })
  }).then((result) => {
    
    if(result){
      res.send({status:200,msg:'获取成功！',data: result});
    }else{
      res.send({status:500,msg:'获取失败!'})
    }
  }).catch((err) => {
      console.log(err);
      res.send({status:500,msg:'获取失败!'})
  })
});

//获取评论列表
app.post('/getComments',(req,res) => {
  let articleId = req.body.articleId
  new Promise((resolve, reject) => {
    commentModel.find({articleId: objectId(articleId)}).populate({path: 'userId',select: 'nickname photo'}).populate('replyList.userId','nickname photo').exec(function(err,doc){
      if(err) reject(err)
      resolve(doc)
    })
  }).then((result) => {
    if(result){
      res.send({status:200,msg:'获取成功！',data: result});
    }else{
      res.send({status:500,msg:'获取失败!'})
    }
  }).catch((err) => {
      console.log(err);
      res.send({status:500,msg:'获取失败!'})
  })
});

// 发表评论
app.post('/insertComment',(req,res) => {
  var userId = req.body.userId
  var articleId = req.body.articleId
  var content = req.body.content
  getSession().then((session) => {
    new Promise((resolve, reject) => {
      commentModel.create([{articleId: objectId(articleId),userId: objectId(userId),content: content, replyList: [],
        gmt_create: getTime(), gmt_modified: getTime()}],{session}).then(res => {
          resolve(res)
        }).catch(e => {
          reject(e)
        })
    }).then((result) => {
      console.log(result)
      issuesModel.updateOne({_id: objectId(articleId)},{$push: {commentList: result[0]._id},
      $set: {gmt_modified: getTime()}},{session},function(err,doc){
        if(err) session.abortTransaction()
        if(doc.nModified === 1){
          session.commitTransaction().then(()=>{
            session.endSession();
          })
          res.send({status:200,msg:'评论成功！'});
        }else {
          res.send({status:500,msg:'评论失败!'})
        }
      })
    }).catch((err) => {
        console.log(err);
        res.send({status:500,msg:'评论失败!'})
    })
  }).catch(e => {

  })
});

// 发表回复
app.post('/insertReply',(req,res) => {
  var commentId = req.body.commentId
  var userId = req.body.userId
  var content = req.body.content
  new Promise((resolve, reject) => {
    commentModel.updateOne({_id: objectId(commentId)},{$push: {replyList: {
      userId: objectId(userId),
      content: content,
      gmt_create: getTime(),
    }},$set: {gmt_modified: getTime()}},function(err,res){
      if(err) reject(err)
      resolve(res)
    })
  }).then((result) => {
      if(result){
        res.send({status:200,msg:'回复成功！'});
      }else{
        res.send({status:500,msg:'回复失败!'})
      }
  }).catch((err) => {
      console.log(err);
      res.send({status:500,msg:'回复失败!'})
  })
});


// 删除评论
app.post('/deleteComment',(req,res) => {
  var id = req.body.id
  new Promise((resolve, reject) => {
    commentModel.deleteOne({_id: objectId(id)},function(err,result){
      if(err) reject(err)
      resolve(result)
    })
  }).then((result) => {
      if(result){
        res.send({status:200,msg:'删除成功！'});
      }else{
        res.send({status:500,msg:'删除评论失败!'})
      }
  }).catch((err) => {
      console.log(err);
      res.send({status:500,msg:'删除评论失败!'})
  })
});

// 删除回复
app.post('/deleteReply',(req,res) => {
  var commentId = req.body.commentId
  var replyId = req.body.replyId
  new Promise((resolve, reject) => {
    commentModel.updateOne({_id: objectId(commentId)},{$pull: {replyList: {_id: objectId(replyId)}}},function(err,result){
      if(err) reject(err)
      resolve(result)
    })
  }).then((result) => {
      if(result.nModified === 1){
        res.send({status:200,msg:'删除成功！'});
      }else{
        res.send({status:500,msg:'删除回复失败!'})
      }
  }).catch((err) => {
      console.log(err);
      res.send({status:500,msg:'删除回复失败!'})
  })
});

module.exports = app;