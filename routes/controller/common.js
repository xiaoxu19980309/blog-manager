// 引入jwt token工具
const JwtUtil = require('../../utils/jwt');
var getTime = require('../../utils/time');
var app = require("express").Router()
const userModel = require('../models/userModel')
const issuesModel = require('../models/issuesModel')
var objectId = require('mongodb').ObjectId;

// 登录
app.post('/login',(req,res) => {
    var userName = req.body.username;
    var pass = req.body.password;
    new Promise((resolve, reject) => {
      userModel.findOne({username: userName}).then(doc => {
        resolve(doc);
      }).catch(e => {
        reject(e)
      })
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
                res.send({status:200,msg:'登陆成功',data: {token:token,nickname: result.nickname, userId: _id,img: result.photo}});
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
      userModel.findOne({username: userName}).then(doc => {
        resolve(doc);
      }).catch(e => {
        reject(e)
      })
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
  var nickname = req.body.nickname
  new Promise((resolve, reject) => {
      userModel.findOne({username: username}).then(doc => {
        resolve(doc);
      }).catch(e => {
        reject(e)
      })
  }).then((result) => {
      if(result){
          res.send({status: 500,msg: '账号已存在！'})
      }else{
        userModel.create({
          username: username, password: password, nickname: nickname,
          isadmin: false,
          gmt_create: getTime(),gmt_modified: getTime()
        }).then(doc => {
          if(doc)
              res.send({status: 200,msg: '注册成功！'})
        }).catch(e => {

        })
      }
  }).catch((err) => {
      res.send({status:500,msg:'账号密码错误'});
  })
});

//获取首页发现
app.post('/find',(req,res) => {
  var limit = req.body.limit? req.body.limit : 10
  var page = req.body.page? req.body.page : 1
  new Promise((resolve,reject)=>{
    issuesModel.find({}).populate('userId','nickname photo').limit(parseInt(limit)).skip((page-1)*limit).exec(function(err,doc){
      if(err) reject(err)
      resolve(doc)
    })
  }).then(result => {
    if(result){
      let count = 0
      result.forEach(element => {
        element.commentsCount = element.commentList.length
        element.likesCount = element.likesList.length
        element.commentList = []
        element.likesList = []
      });
      issuesModel.find({}).estimatedDocumentCount(function(err,num){
        if(err) res.send({status:500,msg:'获取失败!'})
        count = num
        res.send({status:200,msg:'获取成功！',data:result,count: count})
      })
    }else{
      res.send({status:500,msg:'获取失败!'})
    }
  }).catch(e => {
    console.log(e)
  })
})

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

module.exports = app;