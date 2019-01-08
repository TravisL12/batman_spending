"use strict";
const moment = require("moment");

module.exports = {
  dateRange: monthsBack => {
    const startMonth = new Date().getMonth() + 1;
    const startYear = new Date().getFullYear();

    const endDate = moment(`${startYear} ${startMonth}`, "YYYY MM").add(1, "M");
    const startDate = moment(endDate).subtract(monthsBack, "M"); // https://stackoverflow.com/questions/33440646/how-to-properly-add-1-month-from-now-to-current-date-in-moment-js

    return { startDate, endDate };
  }
};
