const { format, differenceInDays, addDays, parse, getYear } = require('date-fns');
const { DEFAULT_IN_OUT_TIME } = require("../constants/enums/employeeEnums");


class EmployeeUtils {

    static convertArrayOfDatesToEmployeePunchObj(arrOfDates) {
        if (Array.isArray(arrOfDates)) {
            return arrOfDates.reduce((acc, item) => {
                return {
                    ...acc,
                    [item]: {
                        "INTime": DEFAULT_IN_OUT_TIME,
                        "OUTTime": DEFAULT_IN_OUT_TIME,
                        "WorkTimeInMins": 0,
                        "WorkTimeInMinsShow": "0"
                    },
                }
            }, {})
        }
        return {};
    }

    static getFormattedDatesBetweenDateRange(startDate, endDate) {
        const formattedDates = [];

        // Parse start and end dates
        let start = new Date(startDate);
        let end = new Date(endDate);

        // Ensure start date is before end date
        if (!start || !end || start > end) {
            throw new Error('Start date must be before or equal to end date');
        }

        start = parse(format(start, "dd/MM/yyyy"), "dd/MM/yyyy", new Date());
        end = parse(format(end, "dd/MM/yyyy"), 'dd/MM/yyyy', new Date());

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

    static parseMinutesToHoursDuration(minutes) {
        if (!minutes) {
            return "0";
        }
        if (typeof minutes !== 'number' || isNaN(minutes)) {
            return '0';
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

    static parseWeeklyReportFileName(startDate, endDate, fileExtension = 'pdf') {
        const formattedStartDate = format(startDate, 'dd_MM_yyyy');
        const formattedEndDate = format(endDate, 'dd_MM_yyyy');
        return `${formattedStartDate}_to_${formattedEndDate}__time_management.${fileExtension}`
    }

    static parseMonthlyReportFileName(date, fileExtension = 'pdf') {
        return `${format(date, 'MMMM')}_${getYear(date)}__time managment.${fileExtension}`;
    }

    static parseExcelSheetName(startDate, endDate) {
        return `${format(startDate, "dd-MM-yyyy")} to ${format(endDate, "dd-MM-yyyy")}`
    }

    static getDayOfWeek(formattedDate) {
        return format(parse(formattedDate, 'dd/MM/yyyy', new Date()), 'EEEE')
    }

    // To validate date format
    static isValidDateFormat = (dateString) => {
        const dateFormat = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
        return dateFormat.test(dateString);
    };


    // to days difference
    static daysDifference = (startDate, endDate) => {
        const daysDifference = differenceInDays(startDate, endDate);
        return daysDifference;
    };

}


module.exports = EmployeeUtils;