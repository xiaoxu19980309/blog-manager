const JwtUtil = require('../../utils/jwt');
var getTime = require('../../utils/time');
var app = require("express").Router()
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
      MongoClient.connect(url, { useNewUrlParser: true,useUnifiedTopology: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("test");
        dbo.collection("collections"). insertOne({userId: userId,name: collectionName, gmt_create: getTime(), gmt_modified: getTime()},function(err, result) {
            if(err) reject(err)
            db.close();
            resolve(result);
        });
      });
  }).then((result) => {
      if(result){
        res.send({status:200,msg:'新建成功！',data: result.ops[0]});
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
    MongoClient.connect(url, { useNewUrlParser: true,useUnifiedTopology: true }, function(err, db) {
      if (err) throw err;
      var dbo = db.db("test");
      dbo.collection("collections").aggregate([{
          $lookup: {
            from: "articles",
            localField: "_id",
            foreignField: "collectionId",
            as: "articleList"
          }
        }
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

// 修改文集
app.post('/editCollection',(req,res) => {
  var collectionName = req.body.name
  var collectionId = req.body.collectionId
  new Promise((resolve, reject) => {
      MongoClient.connect(url, { useNewUrlParser: true,useUnifiedTopology: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("test");
        dbo.collection("collections").updateOne({_id: objectId(collectionId)},{$set:{name: collectionName,gmt_modified: getTime()}},function(err,result){
            if(err) reject(err)
            db.close();
            resolve(result.result);
        });
      });
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
      MongoClient.connect(url, { useNewUrlParser: true,useUnifiedTopology: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("test");
        dbo.collection("collections").remove({_id: objectId(collectionId)},function(err,result){
            if(err) reject(err)
            db.close();
            resolve(result.result);
        });
      });
  }).then((result) => {
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
      MongoClient.connect(url, { useNewUrlParser: true,useUnifiedTopology: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("test");
        dbo.collection("articles").insertOne({collectionId: objectId(collectionId),title: title,content: content, gmt_create: getTime(), gmt_modified: getTime()},function(err,result){
            if(err) reject(err)
            db.close();
            resolve(result.result);
        });
      });
  }).then((result) => {
      if(result.ok === 1){
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
  new Promise((resolve, reject) => {
      MongoClient.connect(url, { useNewUrlParser: true,useUnifiedTopology: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("test");
        if (title&&content) {
          dbo.collection("articles").updateOne({_id: objectId(articleId)},{$set:{title: title, content: content, gmt_modified: getTime()}},function(err,result){
            if(err) reject(err)
            db.close();
            resolve(result.result);
          });
        } else if (!title&&content) {
          dbo.collection("articles").updateOne({_id: objectId(articleId)},{$set:{content: content, gmt_modified: getTime()}},function(err,result){
            if(err) reject(err)
            db.close();
            resolve(result.result);
          });
        } else if(title&&!content){
          dbo.collection("articles").updateOne({_id: objectId(articleId)},{$set:{title: title, gmt_modified: getTime()}},function(err,result){
            if(err) reject(err)
            db.close();
            resolve(result.result);
          });
        }
      });
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
  new Promise((resolve, reject) => {
      MongoClient.connect(url, { useNewUrlParser: true,useUnifiedTopology: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("test");
        dbo.collection("articles").remove({_id: objectId(id)},function(err,result){
            if(err) reject(err)
            db.close();
            resolve(result.result);
        });
      });
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

module.exports = app;