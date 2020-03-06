const connection = require('../../utils/connection');
const likeSchema = require('../schema/likesSchema')

let likesModel = connection.model('likes',likeSchema)

module.exports = likesModel;
