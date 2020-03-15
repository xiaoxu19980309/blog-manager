const connection = require('../../utils/connection');
const commentSchema = require('../schema/commentSchema')

let commentsModel = connection.model('comments',commentSchema)

module.exports = commentsModel;
