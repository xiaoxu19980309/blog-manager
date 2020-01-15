// 引入jwt token工具
var app = require("express").Router()
var MongoClient = require('mongodb').MongoClient;
var getTime = require('../../utils/time');
var objectId = require('mongodb').ObjectId;
var url = "mongodb://localhost:27017/";

//管理员获取用户列表
app.post('/getAllUsers',(req,res) => {
  var page = req.body.page;
  var limit = req.body.limit;
  new Promise((resolve, reject) => {
      MongoClient.connect(url, { useNewUrlParser: true,useUnifiedTopology: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("test");
        dbo.collection("user"). find({}).limit(parseInt(limit)).skip((page-1)*limit).project({password: 0}).toArray(function(err, result) { // 返回集合中所有数据
            if(err) reject(err)
            db.close();
            resolve(result);
        });
      });
  }).then((result) => {
      if(result.length!=0){
          res.send({status:200,msg:'查询成功',data: result,count: result.length});
      }else if(result.length == 0){
          res.send({status:200,msg:'没有用户！'});
      }
  }).catch((err) => {
      res.send({status:500,msg:'查询失败！'});
  })
});

//管理员修改用户权限
app.post('/changePow',(req,res) => {
  var id = req.body.id;
  var isadmin = req.body.isadmin;
  console.log(id,'  ',isadmin,typeof(!!!isadmin))
  new Promise((resolve, reject) => {
      MongoClient.connect(url, { useNewUrlParser: true,useUnifiedTopology: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("test");
        dbo.collection("user").updateOne({_id: objectId(id)},{$set:{isadmin: isadmin==='false'?false:true,gmt_modified: getTime()}},function(err,result){
          if(err) reject(err)
          db.close();
          resolve(result.result);
        })
      });
  }).then((result) => {
    if(result.nModified == 1){
      res.send({status:200,msg:'修改成功',data: result});
    }else{
      res.send({status:500,msg:'修改失败',data: result});
    }
  }).catch((err) => {
      res.send({status:500,msg:'修改失败！'});
  })
});

module.exports = app;