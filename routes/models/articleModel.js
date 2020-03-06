const connection = require('../../utils/connection');
const articleSchema = require('../schema/articleSchema')

let articleModel = connection.model('articles',articleSchema)

module.exports = articleModel;
