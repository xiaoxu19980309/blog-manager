const connection = require('../../utils/connection');
const subjectSchema = require('../schema/subjectSchema')

let storeModel = connection.model('subjects',subjectSchema)

module.exports = storeModel;
