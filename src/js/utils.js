
var moment = require('moment');
var d3 = require('d3');

function daysInMonth(month,year) {
  return new Date(year, month + 1, 0).getDate();
}

function timeRangeInMonths(timeRange) {
  return Math.round(moment(timeRange[1]*1000).diff(moment(timeRange[0]*1000), 'months', true));
}

module.exports.d3FiLocale = d3.locale({
    decimal: ",",
    thousands: "\xa0",
    grouping: [3],
    currency: ["", "\xa0€"],
    dateTime: "%A, %-d. %Bta %Y klo %X",
    date: "%-d.%-m.%Y",
    time: "%H:%M:%S",
    periods: ["a.m.", "p.m."],
    days: ["sunnuntai", "maanantai", "tiistai", "keskiviikko", "torstai", "perjantai", "lauantai"],
    shortDays: ["Su", "Ma", "Ti", "Ke", "To", "Pe", "La"],
    months: ["tammikuu", "helmikuu", "maaliskuu", "huhtikuu", "toukokuu", "kesäkuu", "heinäkuu", "elokuu", "syyskuu", "lokakuu", "marraskuu", "joulukuu"],
    shortMonths: ["Tammi", "Helmi", "Maalis", "Huhti", "Touko", "Kesä", "Heinä", "Elo", "Syys", "Loka", "Marras", "Joulu"]
  });
module.exports.daysInMonth = daysInMonth;
module.exports.timeRangeInMonths = timeRangeInMonths;
