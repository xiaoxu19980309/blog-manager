const JwtUtil = require('../../utils/jwt');
var getTime = require('../../utils/time');
var app = require("express").Router()
const collectionModel = require('../models/collectionModel')
const articleModel = require('../models/articleModel')
const userModel = require('../models/userModel')
const issuesModel = require('../models/issuesModel')
const LikeModel = require('../models/likesModel')
const storeModel = require('../models/storeModel')
var MongoClient = require('mongodb').MongoClient;
var objectId = require('mongodb').ObjectId;
var url = "mongodb://localhost:27017/";

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
    // MongoClient.connect(url, { useNewUrlParser: true,useUnifiedTopology: true }, function(err, db) {
    //   if (err) throw err;
    //   var dbo = db.db("test");
    //   dbo.collection("collections").aggregate([
    //     {
    //       $lookup: {
    //         from: "articles",
    //         localField: "_id",
    //         foreignField: "collectionId",
    //         as: "articleList"
    //       }
    //     },
    //     {
    //       $project: {
    //         articleList: {
    //           $filter: {
    //             input: "$articleList",
    //             as: "item",
    //             cond: { $eq: ["$$item.has_publish", false]}
    //           }
    //         },
    //         name: 1,
    //         userId: 1,
    //       }
    //     }
    //   ]).toArray(function(err, result) {
    //       if(err) reject(err)
    //       db.close();
    //       resolve(result);
    //   });
    // });
    collectionModel.find({userId: objectId(userId)}).populate('articleList').exec(function(err,result){
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
  new Promise((resolve, reject) => {
      collectionModel.remove({_id: objectId(collectionId)},function(err, result){
        if(err) reject(err)
        resolve(result);
      })
  }).then((result) => {
    return new Promise((resovle,reject) => {
      articleModel.remove({collectionId: collectionId},function(err,res){
        if(err) reject(err)
        resovle(res)
      })
    })
  }).then((res) => {
    if(result.ok === 1){
      res.send({status:200,msg:'删除成功！'});
    }else{
      res.send({status:500,msg:'删除文集失败!'})
    }
  }).catch((err) => {
      console.log(err);
      res.send({status:500,msg:'删除文集失败!'})
  })
});

// 新建文章
app.post('/insertArticle',(req,res) => {
  var collectionId = req.body.collectionId
  var title = req.body.title
  var content = req.body.content
  new Promise((resolve, reject) => {
      articleModel.create({collectionId: objectId(collectionId),title: title,content: content, has_publish: false,
        noReprint: false, gmt_create: getTime(), gmt_modified: getTime()}).then(res => {
          resolve(res)
        }).catch(e => {
          reject(e)
      })
  }).then((result)=>{
    return new Promise((resolve,reject) => {
      collectionModel.updateOne({_id: objectId(collectionId)},{$push: {articleList: result._id},$set: {gmt_modified: getTime()}},function(err,res){
        if(err) reject(err)
        resolve(res)
      })
    })
  }).then((result) => {
      if(result){
        res.send({status:200,msg:'新建成功！'});
      }else{
        res.send({status:500,msg:'新建文章失败!'})
      }
  }).catch((err) => {
      console.log(err);
      res.send({status:500,msg:'新建文章失败!'})
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
  new Promise((resolve, reject) => {
      articleModel.remove({_id: objectId(id)},function(err,result){
        if(err) reject(err)
        resolve(result);
      })
  }).then((result) => {
    return new Promise((resolve,reject) => {
      collectionModel.updateOne({_id: objectId(collectionId)},{$pull: {articleList: {ObjectId: result._id}}},function(err,result){
        if(err) reject(err)
        resolve(result)
      })
    })
  }).then((result) => {
      if(result.ok === 1){
        res.send({status:200,msg:'删除成功！'});
      }else{
        res.send({status:500,msg:'删除文章失败!'})
      }
  }).catch((err) => {
      console.log(err);
      res.send({status:500,msg:'删除文章失败!'})
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
  new Promise((resolve, reject) => {
      issuesModel.create({userId: objectId(userId),title: title,content: content, noReprint: false, gmt_create: getTime(), gmt_modified: getTime()}).then(res => {
        resolve(res);
      }).catch(e => {
        reject(e)
      })
  }).then(() => {
    return new Promise((resolve, reject) => {
      articleModel.updateOne({_id: objectId(id)},{$set: {has_publish: true, gmt_modified: getTime()}},function(err,result){
        if(err) reject(err)
        resolve(result);
      })
    })
  }).then((result) => {
    if(result.nModified === 1){
      res.send({status:200,msg:'发布成功！'});
    }else{
      res.send({status:500,msg:'发布文章失败!'})
    }
  }).catch((err) => {
      console.log(err);
      res.send({status:500,msg:'发布文章失败!'})
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
    MongoClient.connect(url, { useNewUrlParser: true,useUnifiedTopology: true }, function(err, db) {
      if (err) throw err;
      var dbo = db.db("test");
      dbo.collection("issues").aggregate([
        {
          $lookup: {
            from: "comments",
            localField: "userId",
            foreignField: "userId",
            as: "commentList"
          }
        },
        {
          $lookup: {
            from: "user",
            localField: "userId",
            foreignField: "_id",
            as: "user"
          }
        },
        // {
        //   $lookup: {
        //     from: "user",
        //     localField: "commentList.userId",
        //     foreignField: "_id",
        //     as: "comment_user"
        //   }
        // },
        {
          $match: {
            _id: objectId(articleId)
          }
        },
        {
          $project: {
            "user.password": 0,
          }
        },
      ]).toArray(function(err, result) {
          if(err) reject(err)
          db.close();
          resolve(result);
      });
    });
  }).then((result) => {
    if(result){
      res.send({status:200,msg:'获取成功！',data: result[0]});
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
    MongoClient.connect(url, { useNewUrlParser: true,useUnifiedTopology: true }, function(err, db) {
      if (err) throw err;
      var dbo = db.db("test");
      dbo.collection("comments").aggregate([
        {
          $lookup: {
            from: "user",
            localField: "userId",
            foreignField: "_id",
            as: "user"
          }
        },
        {
          $match: {
            articleId: objectId(articleId)
          }
        },
        {
          $project: {
            "user.password": 0,
          }
        },
      ]).toArray(function(err, result) {
          if(err) reject(err)
          db.close();
          resolve(result);
      });
    });
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
  new Promise((resolve, reject) => {
      MongoClient.connect(url, { useNewUrlParser: true,useUnifiedTopology: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("test");
        dbo.collection("comments").insertOne({articleId: objectId(articleId),userId: objectId(userId),content: content,
          gmt_create: getTime(), gmt_modified: getTime()},function(err,result){
            if(err) reject(err)
            db.close();
            resolve(result.result);
        });
      });
  }).then((result) => {
      if(result.ok === 1){
        res.send({status:200,msg:'评论成功！'});
      }else{
        res.send({status:500,msg:'评论失败!'})
      }
  }).catch((err) => {
      console.log(err);
      res.send({status:500,msg:'评论失败!'})
  })
});


// 删除评论
app.post('/deleteComment',(req,res) => {
  var id = req.body.id
  new Promise((resolve, reject) => {
      MongoClient.connect(url, { useNewUrlParser: true,useUnifiedTopology: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("test");
        dbo.collection("comments").remove({_id: objectId(id)},function(err,result){
            if(err) reject(err)
            db.close();
            resolve(result.result);
        });
      });
  }).then((result) => {
      if(result.ok === 1){
        res.send({status:200,msg:'删除成功！'});
      }else{
        res.send({status:500,msg:'删除评论失败!'})
      }
  }).catch((err) => {
      console.log(err);
      res.send({status:500,msg:'删除评论失败!'})
  })
});

// 喜欢文章
app.post('/insertLikes',(req,res) => {
  var userId = req.body.userId
  var articleId = req.body.articleId
  var status = req.body.status
  new Promise((resolve, reject) => {
      LikeModel.create({articleId: objectId(articleId),userId: objectId(userId),status: Number(status),
        gmt_create: getTime(), gmt_modified: getTime()}).then(res => {
          resolve(res)
        }).catch(e => {
          reject(e)
      })
  }).then((result) => {
      if(result){
        res.send({status:200,msg:'操作成功！'});
      }else{
        res.send({status:500,msg:'操作失败!'})
      }
  }).catch((err) => {
      console.log(err);
      res.send({status:500,msg:'操作失败!'})
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

// 更新喜欢文章状态
app.post('/updateLikes',(req,res) => {
  var userId = req.body.userId
  var articleId = req.body.articleId
  var status = req.body.status
  new Promise((resolve, reject) => {
      LikeModel.updateOne({userId: objectId(userId),articleId: objectId(articleId)},{$set:{status: Number(status),gmt_modified: getTime()}},function(err,result){
        if(err) reject(err)
        resolve(result)
      })
  }).then((result) => {
      if(result.ok === 1){
        res.send({status:200,msg:'更新成功！'});
      }else{
        res.send({status:500,msg:'更新失败!'})
      }
  }).catch((err) => {
      console.log(err);
      res.send({status:500,msg:'更新失败!'})
  })
});

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
      storeModel.find({userId: objectId(userId)}).limit(parseInt(limit)).skip((page-1)*limit).toArray(function(err,result){
        if(err) reject(err)
        resolve(result);
    });
  }).then((result) => {
    if(result){
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

module.exports = app;