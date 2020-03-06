// connection.js file
const mongoose = require('mongoose');
const conn = mongoose.createConnection(
  'mongodb://localhost:27017/test',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
   }
)
conn.on('open', () => {
    console.log('打开 mongodb 连接');
})
conn.on('err', (err) => {
    console.log('err:' + err);
})

module.exports = conn; //commonJs 语法，导出conn模块。