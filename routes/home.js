var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('home', { title: '后台管理系统',header: '微作管理后台' });
});

module.exports = router;
