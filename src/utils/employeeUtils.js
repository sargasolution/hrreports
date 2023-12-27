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


module.exports = {
    convertArrayOfDatesToEmployeePunchObj,
    getLastSevenFormattedDates
}