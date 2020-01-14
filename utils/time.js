function getTime(){
  var t = new Date()
  var year = t.getFullYear()
  var month = addZero(t.getMonth()+1)
  var day = addZero(t.getDate())
  var hh = addZero(t.getHours())
  var mm = addZero(t.getMinutes())
  var ss = addZero(t.getSeconds())
  return year+'-'+month+'-'+day+' '+hh+':'+mm+':'+ss;
}

function addZero(num){
  return num<10? '0'+num:num;
}

module.exports = getTime