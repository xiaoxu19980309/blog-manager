// 引入jwt token工具
const JwtUtil = require('../../utils/jwt');
var getTime = require('../../utils/time');
var app = require("express").Router()
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

// 登录
app.post('/login',(req,res) => {
    var userName = req.body.username;
    var pass = req.body.password;
    new Promise((resolve, reject) => {
        MongoClient.connect(url, { useNewUrlParser: true,useUnifiedTopology: true }, function(err, db) {
          if (err) throw err;
          var dbo = db.db("test");
          dbo.collection("user"). findOne({username: userName},function(err, result) { // 返回集合中所有数据
              if(err) reject(err)
              db.close();
              resolve(result);
          });
        });
    }).then((result) => {
        if(result){
            var password = result.password
            if(pass == password){
                // 登陆成功，添加token验证
                let _id = result._id.toString();
                // 将用户id传入并生成token
                let jwt = new JwtUtil(_id);
                let token = jwt.generateToken();
                // 将 token 返回给客户端
                res.send({status:200,msg:'登陆成功',data: {token:token,username: result.username}});
            }else{
                res.send({status:500,msg:'账号密码错误'});
            }
        }else{
            res.send({status:500,msg:'账号不存在'})
        }
    }).catch((err) => {
        console.log(err);
        res.send({status:500,msg:'账号密码错误'});
    })
});

//管理员登录
app.post('/adminLogin',(req,res) => {
  var userName = req.body.username;
  var pass = req.body.password;
  new Promise((resolve, reject) => {
      MongoClient.connect(url, { useNewUrlParser: true,useUnifiedTopology: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("test");
        dbo.collection("user"). findOne({username: userName},function(err, result) { // 返回集合中所有数据
            if(err) reject(err)
            db.close();
            resolve(result);
        });
      });
  }).then((result) => {
      if(result){
          var password = result.password
          if(pass == password && result.isadmin){
              // 登陆成功，添加token验证
              let _id = result._id.toString();
              // 将用户id传入并生成token
              let jwt = new JwtUtil(_id);
              let token = jwt.generateToken();
              // 将 token 返回给客户端
              // res.render('home.jade')
              // res.redirect('/home')
              res.send({status:200,msg:'登陆成功',data: {token:token,username: result.username}});
          }else if(!result.isadmin){
              res.send({status:500,msg:'没有管理员权限！'});
          }else if(pass != password){
            res.send({status: 500,msg:'密码错误！'})
          }
      }else{
          res.send({status:500,msg:'账号不存在'})
      }
  }).catch((err) => {
      console.log(err);
      res.send({status:500,msg:'账号密码错误'});
  })
});


//注册
app.post('/register',(req,res) => {
  var username = req.body.username
  var password = req.body.password
  new Promise((resolve, reject) => {
      MongoClient.connect(url, { useNewUrlParser: true,useUnifiedTopology: true }, function(err, db) {
        if (err) throw err;
        var dbo = db.db("test");
        dbo.collection("user").findOne({username: username},function(err, result) { // 返回集合中所有数据
            if(err) reject(err)
            db.close();
            resolve(result);
        });
      });
  }).then((result) => {
      if(result){
          res.send({status: 500,msg: '账号已存在！'})
      }else{
        MongoClient.connect(url, { useNewUrlParser: true,useUnifiedTopology: true }, function(err, db) {
          if (err) throw err;
          var dbo = db.db("test");
          dbo.collection("user").insertOne({
            username: username, password: password,
            gmt_create: getTime(),gmt_modified: getTime()},function(err, result) { // 返回集合中所有数据
            if(err) throw err
            db.close();
            if(result.result.ok === 1)
              res.send({status: 200,msg: '注册成功！'})
          });
        });
      }
  }).catch((err) => {
      res.send({status:500,msg:'账号密码错误'});
  })
});


module.exports = app;