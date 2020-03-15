const mongoose = require('mongoose')
const connection = require('./connection');

async function getSession(opt = {
  readConcern: { level: "snapshot" },
  writeConcern: { w: "majority" }
}){
  const session = await connection.startSession(opt);
  await session.startTransaction();
  return session
}

module.exports = getSession;