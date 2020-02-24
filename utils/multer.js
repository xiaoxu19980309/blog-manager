var moment = require("moment");
var express = require("express");
var path = require('path')
var multer = require('multer');
var storage = multer.diskStorage({
  //文件存储路径
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "/../public/images/temps"));
    },
   //修改上传文件的名字
   //file 是个文件对象 ,fieldname对应在客户端的name属性
   //存储的文件需要自己加上文件的后缀，multer并不会自动添加
   //这里直接忽略文件的后缀.
    filename: function (req, file, cb) {
        var date = new Date();
        cb(null, moment().format("YYYYMMDDhhmmss") + file.originalname);
    }
});
var imageLimit = {
  fieldSize: '2MB'
}
let objMulter = multer({storage : storage,limits: imageLimit });

module.exports = objMulter