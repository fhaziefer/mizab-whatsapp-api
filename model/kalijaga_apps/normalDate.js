const Sequelize = require('sequelize');

var getDate = new Date();

var date = ("0" + getDate.getDate()).slice(-2);
var month = ("0" + (getDate.getMonth() + 1)).slice(-2);
var year = getDate.getFullYear();
let hours = getDate.getHours();
let minutes = getDate.getMinutes();
let seconds = getDate.getSeconds();

var idDate = date+month+year
var dateOnly = year + "-" + month + "-" + date 
var dateTime = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds
var hoursOnly = hours
var timeOnly = hours + ":" + minutes

var curHr = hoursOnly

if (curHr < 12 ) {
    var curHr = 'Sugeng Injing'
} else if (curHr < 18 ) {
    var curHr = 'Sugeng Sonten'
} else {
    var curHr = 'Sugeng Dalu'
}

var normalDate = {
    idDate,
    dateOnly,
    dateTime,
    hoursOnly,
    timeOnly,
    curHr
}

module.exports = normalDate;