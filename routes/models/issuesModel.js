const connection = require('../../utils/connection');
const issuesSchema = require('../schema/issueSchema')

let issuesModel = connection.model('issues',issuesSchema)

module.exports = issuesModel;
