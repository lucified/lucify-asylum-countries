
var moment = require('moment');

function daysInMonth(month,year) {
  return new Date(year, month + 1, 0).getDate();
}

function kmhToDegsPerH(kmh) {
  return kmh / 111;
}

function timeRangeInMonths(timeRange) {
  return Math.round(moment(timeRange[1]*1000).diff(moment(timeRange[0]*1000), 'months', true));
}

module.exports.daysInMonth = daysInMonth;
module.exports.kmhToDegsPerH = kmhToDegsPerH;
module.exports.timeRangeInMonths = timeRangeInMonths;
