"use strict";
const moment = require("moment");

module.exports = {
  dateRange: (year, month, monthsBack = 1) => {
    const date = new Date(year, month, 1);
    const endDate = moment(date);
    const startDate = moment(date).subtract(monthsBack, "M"); // https://stackoverflow.com/questions/33440646/how-to-properly-add-1-month-from-now-to-current-date-in-moment-js

    return { startDate, endDate };
  }
};
