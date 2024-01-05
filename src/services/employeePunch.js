const { format, differenceInMinutes, parse } = require("date-fns");
const path = require("path");
const VendorApiService = require("../services/vendorService");
const EmployeeUtils = require("../utils/employeeUtils");
const FileGenerationService = require("../services/fileGeneration");
const { EmployeeWeeklyPunchEntity } = require("../constants/models/employee");
const { DEFAULT_IN_OUT_TIME, WEEKLY_REPORT_PDF_OPTIONS, FILE_EXTENSIONS } = require("../constants/enums/employeeEnums");

class EmployeePunchService {
    static async generateWeeklyPunchReportsAndExcel(startDate, endDate) {

        try {
            const formattedStartDate = format(startDate, 'dd/MM/yyyy');
            const formattedEndDate = format(endDate, 'dd/MM/yyyy');

            const apiResponse = await VendorApiService.fetchPunchData(formattedStartDate, formattedEndDate);


            if (apiResponse.Error) {
                throw new Error({
                    message: "Error from Vendor API",
                    stack: JSON.stringify(apiResponse)
                })
            }

            // extract atray of punch data
            const arrOfPunchData = apiResponse.InOutPunchData;


            if (Array.isArray(arrOfPunchData) && arrOfPunchData.length) {

                // Create an array to store the formatted dates
                const formattedDates = EmployeeUtils.getFormattedDatesBetweenDateRange(startDate, endDate);

                // create a map to store employee records with id as key and value as a object with name and punch data
                const employeePunchInfo = {};

                arrOfPunchData.forEach((punch) => {
                    if (!(punch.Empcode in employeePunchInfo)) {
                        employeePunchInfo[punch.Empcode] = new EmployeeWeeklyPunchEntity(punch.Name, EmployeeUtils.convertArrayOfDatesToEmployeePunchObj(formattedDates))
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
                            employeePunchInfo[punch.Empcode].punchData[punch.DateString].WorkTimeInMinsShow = EmployeeUtils.parseMinutesToHoursDuration(minutesDifference);
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
                    punchObj.totalMinsWorkedShow = EmployeeUtils.parseMinutesToHoursDuration(punchObj.totalMinsWorked)
                }

                // select weekly ejs path
                const templatePath = path.join(__dirname, '..', 'views', 'reports', 'weekly.ejs');

                // parse target file path where to store the generated pdf
                const destinationPdfPath = path.join(__dirname, '..', 'public', 'reports', EmployeeUtils.parseWeeklyReportFileName(startDate, endDate, FILE_EXTENSIONS.PDF));

                // generate pdf
                await FileGenerationService.generatePdf(templatePath, {
                    employeePunchInfo: Object.values(employeePunchInfo),
                    tableHeaders: formattedDates.map((formattedDate) => ({
                        day: EmployeeUtils.getDayOfWeek(formattedDate),
                        date: formattedDate
                    })),
                    defaultInOutTimeStamp: DEFAULT_IN_OUT_TIME
                }, destinationPdfPath, WEEKLY_REPORT_PDF_OPTIONS);

                // parse target file path where to store the generated excel
                const excelDestinationPath = path.join(__dirname, '..', 'public', 'reports', EmployeeUtils.parseWeeklyReportFileName(startDate, endDate, FILE_EXTENSIONS.EXCEL));

                // generate excel file
                await FileGenerationService.generateWeeklyXlsx(employeePunchInfo, excelDestinationPath, {
                    sheetName: EmployeeUtils.parseExcelSheetName(startDate, endDate),
                    datesList: formattedDates,
                });

            } else {
                throw new Error("No punch data available")
            }
        } catch (err) {
            console.error(err);
            throw err;
        }

    }
}


module.exports = EmployeePunchService;