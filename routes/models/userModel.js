
const connection = require('../../utils/connection');
const userSchema = require('../schema/userSchema')

let userModel = connection.model('users',userSchema)

module.exports = userModel;
