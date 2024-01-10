const { format, differenceInMinutes, parse } = require("date-fns");
const path = require("path");
const VendorApiService = require("../services/vendorService");
const EmployeeUtils = require("../utils/employeeUtils");
const FileGenerationService = require("../services/fileGeneration");
const { EmployeeWeeklyPunchEntity, EmployeeMonthlyPunchEntity } = require("../constants/models/employee");
const { DEFAULT_IN_OUT_TIME, WEEKLY_REPORT_PDF_OPTIONS, MONTHLY_REPORT_PDF_OPTIONS, FILE_EXTENSIONS } = require("../constants/enums/employeeEnums");
const logger = require("../config/logger");

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

                // get comapany logos
                const companyLogoPath = path.join(__dirname, '..', 'public', 'images', 'sarga_logo.png');
                const companySecondaryLogoPath = path.join(__dirname, '..', 'public', 'images', 'team_office_logo.png');

                // generate pdf
                await FileGenerationService.generatePdf(templatePath, {
                    employeePunchInfo: Object.values(employeePunchInfo),
                    tableHeaders: formattedDates.map((formattedDate) => ({
                        day: EmployeeUtils.getDayOfWeek(formattedDate),
                        date: formattedDate
                    })),
                    defaultInOutTimeStamp: DEFAULT_IN_OUT_TIME,
                    companyLogoPath,
                    companySecondaryLogoPath
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
            logger.error(err)
            throw err;
        }

    }


    static async generateMonthlyReportAndExcel(startDate, endDate) {
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
                // create a map to store employee records with id as key and value as a object with name and totalWorkingHours in a month
                const employeePunchInfo = {};

                arrOfPunchData.forEach((punch) => {
                    if (!(punch.Empcode in employeePunchInfo)) {
                        employeePunchInfo[punch.Empcode] = new EmployeeMonthlyPunchEntity(punch.Name)
                    }
                    if (punch.INTime && punch.INTime !== DEFAULT_IN_OUT_TIME && punch.OUTTime && punch.OUTTime !== DEFAULT_IN_OUT_TIME) {
                        const date1 = parse(punch.INTime, 'HH:mm', new Date());
                        const date2 = parse(punch.OUTTime, 'HH:mm', new Date());
                        const minutesDifference = differenceInMinutes(date2, date1);
                        if (minutesDifference >= 0) {
                            employeePunchInfo[punch.Empcode].totalMinsWorked += minutesDifference;
                        }
                    }
                });

                for (let key in employeePunchInfo) {
                    const punchObj = employeePunchInfo[key]
                    punchObj.totalMinsWorkedShow = EmployeeUtils.parseMinutesToHoursDuration(punchObj.totalMinsWorked)
                }


                const templatePath = path.join(__dirname, '..', 'views', 'reports', 'monthly.ejs');

                // get comapany logos
                const companyLogoPath = path.join(__dirname, '..', 'public', 'images', 'sarga_logo.png');
                const companySecondaryLogoPath = path.join(__dirname, '..', 'public', 'images', 'team_office_logo.png');

                const pdfGenerationData = {
                    employeePunchInfo: Object.values(employeePunchInfo),
                    defaultInOutTimeStamp: DEFAULT_IN_OUT_TIME,
                    metaData: {
                        month: format(endDate, 'MMMM'),
                        year: format(endDate, 'yyyy')
                    },
                    companyLogoPath,
                    companySecondaryLogoPath
                };

                const pdfDestinationPath = path.join(__dirname, '..', 'public', 'reports', EmployeeUtils.parseMonthlyReportFileName(endDate, FILE_EXTENSIONS.PDF));

                await FileGenerationService.generatePdf(templatePath, pdfGenerationData, pdfDestinationPath, MONTHLY_REPORT_PDF_OPTIONS)


                const excelDestinationPath = path.join(__dirname, '..', 'public', 'reports', EmployeeUtils.parseMonthlyReportFileName(endDate, FILE_EXTENSIONS.EXCEL));

                await FileGenerationService.generateMonthlyXlsx(Object.values(employeePunchInfo), excelDestinationPath, {
                    columns: [
                        { header: 'Employee Name', key: 'name', width: 50 },
                        { header: 'Hrs', key: 'totalMinsWorkedShow', width: 10 },
                    ],
                    sheetName: `${format(endDate, 'MMM')}, ${format(endDate, 'yyyy')}`
                });

                // return res.render("./reports/monthly", {
                //     employeePunchInfo: Object.values(employeePunchInfo),
                //     defaultInOutTimeStamp: DEFAULT_IN_OUT_TIME,
                //     metaData: {
                //         month: format(today, 'MMMM'),
                //         year: format(today, 'yyyy')
                //     }
                // })
            } else {
                throw new Error("No punch data available")
            }
        } catch (err) {
            logger.error(err)
            throw err;
        }
    }
}


module.exports = EmployeePunchService;