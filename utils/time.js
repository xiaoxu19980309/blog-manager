function getTime(){
  var d = new Date()
  d.setMinutes(d.getMinutes()-d.getTimezoneOffset())
  return d.toISOString()
}

module.exports = getTime