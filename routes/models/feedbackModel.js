const connection = require('../../utils/connection');
const feedbackSchema = require('../schema/feedbackSchema')

let feedbackModel = connection.model('feedbacks',feedbackSchema)

module.exports = feedbackModel;
