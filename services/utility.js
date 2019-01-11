"use strict";
const moment = require("moment");

module.exports = {
  dateRange: (year, month, monthsBack = 1) => {
    const date = new Date(year, month);
    const endDate = moment(date);
    const startDate = moment(date).subtract(monthsBack, "M");

    return { startDate, endDate };
  }
};
