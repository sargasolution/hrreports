const { format, subDays } = require('date-fns');

function convertArrayOfDatesToEmployeePunchObj(arrOfDates) {
    if (Array.isArray(arrOfDates)) {
        return arrOfDates.reduce((acc, item) => {
            return {
                ...acc,
                [item]: {
                    "INTime": null,
                    "OUTTime": null,
                    "WorkTimeInMins": null
                },
            }
        }, {})
    }
    return {};
}


function getLastSevenFormattedDates() {
    const today = new Date();
    const formattedDates = [];
    for (let i = 0; i < 7; i++) {
        const currentDateMinusDays = subDays(today, i);
        const formattedDate = format(currentDateMinusDays, 'dd/MM/yyyy');
        formattedDates.push(formattedDate);
    }
    return formattedDates;
}

function parseMinutesToHoursDuration(minutes) {
    if (typeof minutes !== 'number' || isNaN(minutes)) {
        return 'Invalid input. Please provide a valid number of minutes.';
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(remainingMinutes).padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}`;
}

module.exports = {
    convertArrayOfDatesToEmployeePunchObj,
    getLastSevenFormattedDates,
    parseMinutesToHoursDuration
}