const connection = require('../../utils/connection');
const storeSchema = require('../schema/storeSchema')

let storeModel = connection.model('stores',storeSchema)

module.exports = storeModel;
