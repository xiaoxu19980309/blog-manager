// 引入jwt token工具
var app = require("express").Router()
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

//管理员获取用户列表
app.post('/getAllUsers',(req,res) => {
  new Promise((resolve, reject) => {
      MongoClient.connect(url, { useNewUrlParser: true,useUnifiedTopology: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("test");
        dbo.collection("user"). find({}).project({password: 0}).toArray(function(err, result) { // 返回集合中所有数据
            if(err) reject(err)
            db.close();
            resolve(result);
        });
      });
  }).then((result) => {
      if(result.length!=0){
          res.send({status:200,msg:'查询成功',data: result});
      }else if(result.length == 0){
          res.send({status:200,msg:'没有用户！'});
      }
  }).catch((err) => {
      res.send({status:500,msg:'查询失败！'});
  })
});

module.exports = app;