const cron = require('node-cron');
const { format, endOfWeek, startOfWeek, subDays, parse, differenceInMinutes, getWeek, getYear } = require("date-fns");
const VendorApiService = require("../services/vendorService");
const { getFormattedDatesBetweenDateRange, convertArrayOfDatesToEmployeePunchObj, parseMinutesToHoursDuration } = require("../utils/employeeUtils");
const { DEFAULT_IN_OUT_TIME, WEEKLY_REPORT_PDF_OPTIONS } = require("../constants/enums/employeeEnums");
const { generatePdf, generateWeeklyXlsx } = require("../services/fileGeneration");
const { EmployeeWeeklyPunchEntity } = require("../constants/models/employee");
const path = require("path")

class ReportingCron {
    static run() {
        cron.schedule('*/2 * * * *', async () => {
            try {

                // Calculate last week's start and end dates
                const today = new Date();
                const lastMonday = subDays(today, 7);
                const startDate = startOfWeek(lastMonday);
                const endDate = endOfWeek(lastMonday);
                const shortMonthName = format(startDate, 'MMM')
                const year = getYear(startDate);
                const formattedStartDate = format(startDate, 'dd/MM/yyyy');
                const formattedEndDate = format(endDate, 'dd/MM/yyyy');

                // Get week number based on month
                const weekNumber = getWeek(startDate, { weekStartsOn: 1 });

                const apiResponse = await VendorApiService.fetchPunchData(formattedStartDate, formattedEndDate);

                // extract atray of punch data
                const arrOfPunchData = apiResponse.InOutPunchData;

                if (Array.isArray(arrOfPunchData) && arrOfPunchData.length) {
                    // Create an array to store the formatted dates
                    const formattedDates = getFormattedDatesBetweenDateRange(startDate, endDate);

                    // create a map to store employee records with id as key and value as a object with name and punch data
                    const employeePunchInfo = {};

                    arrOfPunchData.forEach((punch) => {
                        if (!(punch.Empcode in employeePunchInfo)) {
                            employeePunchInfo[punch.Empcode] = new EmployeeWeeklyPunchEntity(punch.Name, convertArrayOfDatesToEmployeePunchObj(formattedDates))
                        }
                        if (punch.DateString in employeePunchInfo[punch.Empcode].punchData) {
                            employeePunchInfo[punch.Empcode].punchData[punch.DateString].INTime = punch.INTime;
                            employeePunchInfo[punch.Empcode].punchData[punch.DateString].OUTTime = punch.OUTTime;
                            employeePunchInfo[punch.Empcode].punchData[punch.DateString].WorkTimeInMinsShow = "0"
                            if (punch.INTime && punch.INTime !== DEFAULT_IN_OUT_TIME && punch.OUTTime && punch.OUTTime !== DEFAULT_IN_OUT_TIME) {
                                const date1 = parse(punch.INTime, 'HH:mm', new Date());
                                const date2 = parse(punch.OUTTime, 'HH:mm', new Date());
                                const minutesDifference = differenceInMinutes(date2, date1);
                                employeePunchInfo[punch.Empcode].punchData[punch.DateString].WorkTimeInMins = minutesDifference;
                                employeePunchInfo[punch.Empcode].punchData[punch.DateString].WorkTimeInMinsShow = parseMinutesToHoursDuration(minutesDifference);
                                if (minutesDifference >= 0) {
                                    employeePunchInfo[punch.Empcode].totalMinsWorked += minutesDifference;
                                }
                            } else {
                                employeePunchInfo[punch.Empcode].punchData[punch.DateString].WorkTimeInMins = 0;
                            }
                        }
                    })

                    // parse total mins work to duration
                    for (let key in employeePunchInfo) {
                        const punchObj = employeePunchInfo[key]
                        punchObj.totalMinsWorkedShow = parseMinutesToHoursDuration(punchObj.totalMinsWorked)
                    }


                    // select weekly ejs path
                    const templatePath = path.join(__dirname, '..', 'views', 'reports', 'weekly.ejs');
                    // parse target file path where to store the generated pdf
                    const destinationPdfPath = path.join(__dirname, '..', 'public', 'reports', `${year}_${shortMonthName}_Week_${weekNumber}_time_management.pdf`);
                    // generate pdf
                    await generatePdf(templatePath, {
                        employeePunchInfo: Object.values(employeePunchInfo),
                        tableHeaders: formattedDates.map((formattedDate) => ({
                            day: format(parse(formattedDate, 'dd/MM/yyyy', new Date()), 'EEEE'),
                            date: formattedDate
                        })),
                        defaultInOutTimeStamp: DEFAULT_IN_OUT_TIME
                    }, destinationPdfPath, WEEKLY_REPORT_PDF_OPTIONS);

                    // parse target file path where to store the generated excel
                    const excelDestinationPath = path.join(__dirname, '..', 'public', 'reports', `${year}_${shortMonthName}_Week_${weekNumber}_time_management.xlsx`);
                    // generate excel file
                    await generateWeeklyXlsx(employeePunchInfo, excelDestinationPath, {
                        sheetName: `${format(startDate, "dd-MM-yyyy")} to ${format(endDate, "dd-MM-yyyy")}`,
                        datesList: formattedDates,
                    });

                }

            } catch (err) {
                console.error(err);
            }
        });
    }
}

module.exports = ReportingCron;