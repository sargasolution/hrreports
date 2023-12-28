const { format, differenceInDays, addDays } = require('date-fns');
const { DEFAULT_IN_OUT_TIME } = require("../constants/enums/employeeEnums");


function convertArrayOfDatesToEmployeePunchObj(arrOfDates) {
    if (Array.isArray(arrOfDates)) {
        return arrOfDates.reduce((acc, item) => {
            return {
                ...acc,
                [item]: {
                    "INTime": DEFAULT_IN_OUT_TIME,
                    "OUTTime": DEFAULT_IN_OUT_TIME,
                    "WorkTimeInMins": null
                },
            }
        }, {})
    }
    return {};
}


function getFormattedDatesBetweenDateRange(startDate, endDate) {
    const formattedDates = [];

    // Parse start and end dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Ensure start date is before end date
    if (!start || !end || start > end) {
        throw new Error('Start date must be before or equal to end date');
    }

    // Calculate the difference in days between start and end dates
    const daysDifference = differenceInDays(end, start);

    // Generate formatted dates within the range
    for (let i = 0; i <= daysDifference; i++) {
        const currentDate = addDays(start, i);
        const formattedDate = format(currentDate, 'dd/MM/yyyy');
        formattedDates.push(formattedDate);
    }

    return formattedDates;
}

function parseMinutesToHoursDuration(minutes) {
    if (typeof minutes !== 'number' || isNaN(minutes)) {
        return 'Invalid input. Please provide a valid number of minutes.';
    }

    if (minutes <= 0) {
        return "0";
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(remainingMinutes).padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}`;
}

module.exports = {
    convertArrayOfDatesToEmployeePunchObj,
    getFormattedDatesBetweenDateRange,
    parseMinutesToHoursDuration
}