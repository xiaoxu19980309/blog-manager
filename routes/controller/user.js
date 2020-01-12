// 引入jwt token工具
const JwtUtil = require('../../utils/jwt');
var app = require("express").Router()
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

// 登录
app.post('/login',(req,res) => {
    var userName = req.query.username;
    var pass = req.query.password;
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
        console.log(result,'1111');
        if(result){
            var password = result.password
            if(pass == password){
                // 登陆成功，添加token验证
                let _id = result._id.toString();
                // 将用户id传入并生成token
                let jwt = new JwtUtil(_id);
                let token = jwt.generateToken();
                // 将 token 返回给客户端
                res.send({status:200,msg:'登陆成功',token:token});
            }else{
                res.send({status:400,msg:'账号密码错误'});
            }
        }else{
            res.send({status:404,msg:'账号不存在'})
        }
    }).catch((err) => {
        console.log(err);
        res.send({status:500,msg:'账号密码错误'});
    })
});

module.exports = app;