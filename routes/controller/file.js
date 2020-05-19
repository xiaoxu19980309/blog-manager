var multer = require('../../utils/multer')
var path = require('path')
var app = require("express").Router()
var fs = require("fs");

// var uploadFileDomin = location.origin

// 图片上传
app.post('/upload',multer.single('file'),function(req,res,next) {
  var fileName = req.file.filename;
  var destDir = '/public/images/temps'
  var sourceFile = req.file.path;
  var destPath = path.join(__dirname.replace("routes\\controller", ""), destDir, fileName);
  var dest_Dir = path.join(__dirname.replace("routes\\controller", ""), destDir);
  var fileurl = 'http://localhost:3000/' + destPath.substr(destPath.indexOf("images"));
  fileurl = fileurl.replace(/\\/g, "/");
  console.log(destPath, '   ',dest_Dir, '   ',fileurl)
  fs.exists(dest_Dir, function (exists) {
    if (exists) {
      fs.rename(sourceFile, destPath, function (err) {
        res.send({status: 200, message: '上传成功！', data: fileurl})
      });
    }
    else {
      fs.mkdir(dest_Dir, 0777, function (err) {
        if (err) {
          res.send({status: 500, message: '上传失败！', data: []})
        } else {
          fs.rename(sourceFile, destPath, function (err) {
            res.send({status: 200, message: '上传成功', data: fileurl})
          });
        }
      })
    }
  });
});

module.exports = app;