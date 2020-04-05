var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var debug = require('debug')('blog-manager:server');
var http = require('http');
var ejs = require('ejs')
var JwtUtil = require('./utils/jwt')

var indexRouter = require('./routes/index');
var homeRouter = require('./routes/home')
var UserRouter = require('./routes/manager/userManager')
var articleRouter = require('./routes/manager/articleManager')
var subjectRouter = require('./routes/manager/subjectManager')
var contributionRouter = require('./routes/manager/contributionManager')
var usersRouter = require('./routes/users');

var test = require('./routes/controller/test')
var commonApi = require('./routes/controller/common')
var userApi = require('./routes/controller/user')
var articleApi = require('./routes/controller/article')
var operateApi = require('./routes/controller/operate')
var subjectApi = require('./routes/controller/subject')
var fileApi = require('./routes/controller/file')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('.html',ejs.__express);
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/home',homeRouter);
app.use('/home/userManager',UserRouter);
app.use('/home/articleManager',articleRouter)
app.use('/home/subjectManager',subjectRouter)
app.use('/home/contributionManager',contributionRouter)
app.use('/users', usersRouter);
//设置跨域访问
app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With,token");
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By",' 3.2.1')
  res.header("Content-Type", "application/json;charset=utf-8");
  if (req.method.toLowerCase() == 'options')
    res.sendStatus(200);  //让options尝试请求快速结束
  else
    next();
});
//接口过滤
app.use(function (req, res, next) {
  // 我这里把登陆和注册请求去掉了，其他的多有请求都需要进行token校验 
  if (req.url.indexOf('/api')>=0 && req.url.indexOf('common') == -1) {
    let token = req.headers.token;
    let jwt = new JwtUtil(token);
    let result = jwt.verifyToken();
    // 如果考验通过就next，否则就返回登陆信息不正确
    if (result == 'err') {
        console.log(result);
        res.send({status: 403, msg: '登录已过期,请重新登录'});
        // res.render('login.html');
    } else {
      next();
    }
  } else {
      next();
  }
})
app.use('/test',test);
app.use('/api/common',commonApi);
app.use('/api/user',userApi);
app.use('/api/article',articleApi);
app.use('/api/operate',operateApi)
app.use('/api/subject',subjectApi)
app.use('/api/file/',fileApi)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */
var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

module.exports = app;
