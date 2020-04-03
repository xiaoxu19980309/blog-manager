const connection = require('../../utils/connection');
const contribution = require('../schema/contributionSchema')

let contributionModel = connection.model('contributions',contribution)

module.exports = contributionModel;
