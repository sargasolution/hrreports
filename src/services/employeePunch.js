const { format, differenceInMinutes, parse } = require("date-fns");
const path = require("path");
const VendorApiService = require("../services/vendorService");
const EmployeeUtils = require("../utils/employeeUtils");
const FileGenerationService = require("../services/fileGeneration");
const { EmployeeWeeklyPunchEntity, EmployeeMonthlyPunchEntity } = require("../constants/models/employee");
const { DEFAULT_IN_OUT_TIME, WEEKLY_REPORT_PDF_OPTIONS, MONTHLY_REPORT_PDF_OPTIONS, FILE_EXTENSIONS, ENCODED_IMAGES } = require("../constants/enums/employeeEnums");
const logger = require("../config/logger");
const ExcelSheetReader = require("./excelSheet");

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

                        if (punch.INTime && punch.INTime !== DEFAULT_IN_OUT_TIME && punch.OUTTime && punch.OUTTime !== DEFAULT_IN_OUT_TIME) {
                            const date1 = parse(punch.INTime, 'HH:mm', new Date());
                            const date2 = parse(punch.OUTTime, 'HH:mm', new Date());
                            const minutesDifference = differenceInMinutes(date2, date1);
                            employeePunchInfo[punch.Empcode].punchData[punch.DateString].WorkTimeInMins = minutesDifference;
                            employeePunchInfo[punch.Empcode].punchData[punch.DateString].WorkTimeInMinsShow = EmployeeUtils.parseMinutesToHoursDuration(minutesDifference);
                            if (minutesDifference >= 0) {
                                employeePunchInfo[punch.Empcode].totalMinsWorked += minutesDifference;
                            }
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
                        date: formattedDate,
                        formattedDate: format(parse(formattedDate, 'dd/MM/yyyy', new Date()), 'MM/dd/yyyy'),
                    })),
                    defaultInOutTimeStamp: DEFAULT_IN_OUT_TIME,
                    companyLogoPath: ENCODED_IMAGES.COMPANY_LOGO,
                    companySecondaryLogoPath: ENCODED_IMAGES.COMPANY_SECONDAY_LOGO
                }, destinationPdfPath, WEEKLY_REPORT_PDF_OPTIONS);

                // parse target file path where to store the generated excel
                const excelDestinationPath = path.join(__dirname, '..', 'public', 'reports', EmployeeUtils.parseWeeklyReportFileName(startDate, endDate, FILE_EXTENSIONS.EXCEL));

                // generate excel file
                await FileGenerationService.generateWeeklyXlsx(employeePunchInfo, excelDestinationPath, {
                    sheetName: EmployeeUtils.parseExcelSheetName(startDate, endDate),
                    datesList: formattedDates.map((formattedDate) => format(parse(formattedDate, 'dd/MM/yyyy', new Date()), 'MM/dd/yyyy')),
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
            const employeePerHourRates = await ExcelSheetReader.authenticateUserAndMapExcelData();
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
                        employeePunchInfo[punch.Empcode] = new EmployeeMonthlyPunchEntity(punch.Name, employeePerHourRates[punch.Empcode])
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

                    punchObj.totalAmount = EmployeeUtils.calculateEmployeeSalary(punchObj.totalMinsWorked, punchObj.pricePerHour);
                }

                const templatePath = path.join(__dirname, '..', 'views', 'reports', 'monthly.ejs');

                const pdfGenerationData = {
                    employeePunchInfo: Object.values(employeePunchInfo),
                    defaultInOutTimeStamp: DEFAULT_IN_OUT_TIME,
                    metaData: {
                        month: format(endDate, 'MMMM'),
                        year: format(endDate, 'yyyy')
                    },
                    companyLogoPath: ENCODED_IMAGES.COMPANY_LOGO,
                    companySecondaryLogoPath: ENCODED_IMAGES.COMPANY_SECONDAY_LOGO
                };

                const pdfDestinationPath = path.join(__dirname, '..', 'public', 'reports', EmployeeUtils.parseMonthlyReportFileName(endDate, FILE_EXTENSIONS.PDF));

                await FileGenerationService.generatePdf(templatePath, pdfGenerationData, pdfDestinationPath, MONTHLY_REPORT_PDF_OPTIONS)


                const excelDestinationPath = path.join(__dirname, '..', 'public', 'reports', EmployeeUtils.parseMonthlyReportFileName(endDate, FILE_EXTENSIONS.EXCEL));

                await FileGenerationService.generateMonthlyXlsx(Object.values(employeePunchInfo), excelDestinationPath, {
                    columns: [
                        { header: 'Employee Name', key: 'name', width: 50 },
                        { header: 'Hrs', key: 'totalMinsWorkedShow', width: 20 },
                        { header: 'Amount USD $', key: 'totalAmount', width: 20 },
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