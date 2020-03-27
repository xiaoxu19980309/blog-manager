// 引入jwt token工具
var app = require("express").Router()
var getTime = require('../../utils/time');
var objectId = require('mongodb').ObjectId;
const userModel = require('../models/userModel')
const feedbackModel = require('../models/feedbackModel')
const getSession = require('../../utils/session')

//管理员获取用户列表
app.post('/getAllUsers',(req,res) => {
  var page = req.body.page;
  var limit = req.body.limit;
  new Promise((resolve, reject) => {
      userModel.find({},'_id username nickname gmt_create gmt_modified isadmin').limit(parseInt(limit)).skip((page-1)*limit).then(result => {
        resolve(result);
      }).catch(e => {
        reject(e)
      })
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
  new Promise((resolve, reject) => {
      userModel.updateOne({_id: objectId(id)},{$set:{isadmin: isadmin,gmt_modified: getTime()}}).then(res => {
        resolve(res);
      }).catch(e => {
        reject(e)
      })
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


//用户获取账号个人资料
app.post('/getProInfo',(req,res) => {
  var id = req.body.id
  new Promise((resolve, reject) => {
      userModel.findOne({_id: objectId(id)},'nickname phone photo sex description net').then(res => {
        resolve(res)
      }).catch(e => {
        reject(e)
      })
  }).then((result) => {
      if(result){
          res.send({status:200,msg:'查询成功',data: result});
      }else if(result.length == 0){
          res.send({status:200,msg:'没有用户！'});
      }
  }).catch((err) => {
      res.send({status:500,msg:'查询失败！'});
  })
});

//用户修改账号个人资料
app.post('/changePro',(req,res) => {
  var id = req.body.id;
  var sex = req.body.sex;
  var description = req.body.description;
  var net = req.body.net;
  new Promise((resolve, reject) => {
      userModel.updateOne({_id: objectId(id)},{$set:{sex: sex,description: description,net: net,gmt_modified: getTime()}},function(err, result){
        if(err) reject(err)
        resolve(result)
      })
  }).then((result) => {
    if(result.nModified === 1){
      res.send({status:200,msg:'修改成功',data: result});
    }else{
      res.send({status:500,msg:'修改失败',data: result});
    }
  }).catch((err) => {
      res.send({status:500,msg:'修改失败！'});
  })
});

//用户修改账号基本资料
app.post('/changeBasic',(req,res) => {
  var id = req.body.id
  var photo = req.body.photo
  var nickname = req.body.nickname
  var phone = req.body.phone
  new Promise((resolve, reject) => {
      userModel.updateOne({_id: objectId(id)},{$set:{photo: photo,nickname: nickname,phone: phone,gmt_modified: getTime()}},function(err, result){
        if(err) reject(err)
        resolve(result)
      })
  }).then((result) => {
    if(result.nModified === 1){
      res.send({status:200,msg:'修改成功',data: result});
    }else{
      res.send({status:500,msg:'修改失败',data: result});
    }
  }).catch((err) => {
      res.send({status:500,msg:'修改失败！'});
  })
});

//填写反馈意见
app.post('/feedback',(req,res) => {
  var suggestion = req.body.suggestion
  var phone = req.body.phone
  new Promise((resolve, reject) => {
      feedbackModel.create({suggestion: suggestion, phone: phone,gmt_create: getTime()}).then(res => {
        resolve(res)
      }).catch(e => {
        reject(e)
      })
  }).then((result) => {
      if(result){
        res.send({status: 200,msg: '反馈成功！',data: result})
      } else {
        res.send({status: 500,msg: '反馈失败！'})
      }
  }).catch((err) => {
      res.send({status:500,msg:'反馈失败！'});
  })
});

//根据搜索用户
app.post('/getUserByName',(req,res) => {
  var name = req.body.name
  var limit = req.body.limit? req.body.limit : 10
  var page = req.body.page? req.body.page : 1
  let reg = new RegExp(name, 'i')
  new Promise((resolve, reject) => {
      userModel.find({$or: [{nickname: {$regex: reg}},{isadmin: false}]},'_id nickname photo fansList focusList articleList')
      .populate({path: 'articleList'})
      .limit(parseInt(limit)).skip((page-1)*limit).then(result => {
        resolve(result);
      }).catch(e => {
        reject(e)
      })
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

//获取关注用户列表
app.post('/getFocusList',(req,res) => {
  var id = req.body.userId
  new Promise((resolve, reject) => {
    userModel.findOne({_id: objectId(id)},'nickname photo gmt_create gmt_modified focusList')
    .populate({path: 'focusList',select: 'nickname photo articleList fansList focusList',populate: {path: 'articleList'}})
    .populate('fansList','nickname photo articleList fansList focusList')
    .then(result => {
      resolve(result);
    }).catch(e => {
      reject(e)
    })
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

//关注用户
app.post('/focusUser',(req,res)=>{
  var userId = req.body.userId
  var focusId = req.body.focusId
  getSession().then((session)=>{
    new Promise((resolve,reject) => {
      userModel.updateOne({_id: objectId(userId)},{$push: {focusList: objectId(focusId)},$set: {gmt_modified: getTime()}},{session}).then(doc => {
        resolve(doc)
      }).catch(e => {
        reject(e)
      })
    }).then(doc => {
      if(doc.nModified === 1) {
        userModel.updateOne({_id: objectId(focusId)},{$push: {fansList: objectId(userId)},$set: {gmt_modified: getTime()}},{session},function(err,doc2){
          if(err) session.abortTransaction()
          if (doc2.nModified === 1) {
            res.send({status:200,msg:'关注成功！'});
            session.commitTransaction().then(()=>{
              session.endSession()
            }).catch(e => {})
          } else {
            res.send({status:500,msg:'关注失败!'})
            session.abortTransaction()
          }
        })
      }else {
        res.send({status:500,msg:'关注失败!'})
      }
    }).catch(err => {
      console.log(err)
    })
  }).catch(e => {
    console.log(e)
  })
})

//取消关注
app.post('/cancelFocusUser',(req,res)=>{
  var userId = req.body.userId
  var focusId = req.body.focusId
  getSession().then((session) => {
    new Promise((resolve,reject)=>{
      userModel.updateOne({_id: objectId(userId)},{$pull: {focusList: objectId(focusId)},$set: {gmt_modified: getTime()}},{session})
      .then(res => {
        resolve(res)
      }).catch(e => {
        reject(e)
      })
    }).then(doc => {
      userModel.updateOne({_id: objectId(focusId)},{$pull: {fansList: objectId(userId)},$set: {gmt_modified: getTime()}},{session})
      .then(doc2 => {
        if(doc2.nModified === 1){
          res.send({status:200,msg:'取消关注成功！'});
          session.commitTransaction(()=>{
            session.endSession()
          })
        }else{
          session.abortTransaction()
          res.send({status:500,msg:'取消关注失败!'})
        }
      }).catch(e => {

      })
    }).catch(e => {
      console.log(e)
    })
  })
})

//获取添加关注推荐
app.post('/getRecommend',(req,res) => {
  var userId = req.body.userId
  new Promise((resolve, reject) => {
    userModel.find({_id: {$ne: objectId(userId)}},'nickname description photo gmt_create gmt_modified fansList articleList')
    .populate('articleList')
    .sort({gmt_modified: -1})
    .then(result => {
      resolve(result);
    }).catch(e => {
      reject(e)
    })
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