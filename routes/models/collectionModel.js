const connection = require('../../utils/connection');
const collectionSchema = require('../schema/collectionSchema')

let collectionModel = connection.model('collections',collectionSchema)

module.exports = collectionModel;
