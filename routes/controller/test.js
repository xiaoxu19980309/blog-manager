var express = require('express');
var app = require("express").Router()
app.post('/test1',(req,res)=>{
  var MongoClient = require('mongodb').MongoClient;
  var url = "mongodb://localhost:27017/";
  
  MongoClient.connect(url, { useNewUrlParser: true,useUnifiedTopology: true }, function(err, db) {
      if (err) throw err;
      var dbo = db.db("test");
      dbo.collection("runoob"). find({}).toArray(function(err, result) { // 返回集合中所有数据
          if (err) throw err;
          res.json({
            list: result
          })
          db.close();
      });
  });
  
})

module.exports = app;