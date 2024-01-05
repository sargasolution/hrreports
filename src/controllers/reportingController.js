const axiosInstance = require('../utils/axiosConfig');
const { format, subDays, parse, differenceInMinutes, startOfMonth, endOfMonth } = require('date-fns');
const { DOWNLOAD_IN_OUT_PUNCH_DATA } = require('../constants/urls/vendorUrls.js');
const { DEFAULT_IN_OUT_TIME, MONTHLY_REPORT_PDF_OPTIONS } = require("../constants/enums/employeeEnums.js");
const { parseMinutesToHoursDuration } = require("../utils/employeeUtils")
const { EmployeeMonthlyPunchEntity } = require("../constants/models/employee.js");
const { generatePdf, generateMonthlyXlsx } = require("../services/fileGeneration");
const path = require('path');
const EmployeePunchService = require("../services/employeePunch");

class ReportingController {
    static async handlePunchDataInOutWeeklyGetRequest(req, res) {
        try {
            const today = new Date("2023-12-23");
            const sevenDaysAgo = subDays(today, 6);

            await EmployeePunchService.generateWeeklyPunchReportsAndExcel(sevenDaysAgo, today);
            // await EmailCommunication.sendWeeklyTransacionalMail();

            return res.json({
                "Error": false,
                "Msg": "Pdf generated successfully",
            })

            // return res.render("./reports/weekly", {
            //     employeePunchInfo: Object.values(employeePunchInfo),
            //     tableHeaders: formattedDates.map((date) => ({
            //         day: format(parse(date, 'dd/MM/yyyy', new Date()), 'EEEE'),
            //         date
            //     })),
            //     defaultInOutTimeStamp: DEFAULT_IN_OUT_TIME
            // })
        } catch (err) {
            console.error(err);
            return res.json(err);
        }
    }


    static async handlePunchDataInOutMonthlyGetRequest(req, res) {
        try {
            const today = new Date();
            const startOfCurrentMonth = startOfMonth(today);
            const endOfCurrentMonth = endOfMonth(today);

            const response = await axiosInstance.get(DOWNLOAD_IN_OUT_PUNCH_DATA, {
                params: {
                    Empcode: 'ALL',
                    FromDate: format(startOfCurrentMonth, 'dd/MM/yyyy'),
                    ToDate: format(endOfCurrentMonth, 'dd/MM/yyyy')
                }
            })

            const apiResponse = response.data;

            if (apiResponse.Error) {
                return res.json(apiResponse)
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
                    punchObj.totalMinsWorkedShow = parseMinutesToHoursDuration(punchObj.totalMinsWorked)
                }


                const templatePath = path.join(__dirname, '..', 'views', 'reports', 'monthly.ejs');

                const pdfGenerationData = {
                    employeePunchInfo: Object.values(employeePunchInfo),
                    defaultInOutTimeStamp: DEFAULT_IN_OUT_TIME,
                    metaData: {
                        month: format(today, 'MMMM'),
                        year: format(today, 'yyyy')
                    }
                };

                const pdfDestinationPath = path.join(__dirname, '..', 'public', 'reports', 'output_monthly.pdf');

                await generatePdf(templatePath, pdfGenerationData, pdfDestinationPath, MONTHLY_REPORT_PDF_OPTIONS)


                const excelDestinationPath = path.join(__dirname, '..', 'public', 'reports', 'output_monthly.xlsx');

                await generateMonthlyXlsx(Object.values(employeePunchInfo), excelDestinationPath, {
                    columns: [
                        { header: 'Employee Name', key: 'name', width: 50 },
                        { header: 'Hrs', key: 'totalMinsWorkedShow', width: 10 },
                    ],
                    sheetName: `Punch Report ${format(today, 'MMM')}, ${format(today, 'yyyy')}`
                });

                return res.json({
                    "Error": false,
                    "Msg": "Pdf and Excel sheet generated successfully",
                })

                // return res.render("./reports/monthly", {
                //     employeePunchInfo: Object.values(employeePunchInfo),
                //     defaultInOutTimeStamp: DEFAULT_IN_OUT_TIME,
                //     metaData: {
                //         month: format(today, 'MMMM'),
                //         year: format(today, 'yyyy')
                //     }
                // })
            }

            return res.json(apiResponse)

        } catch (err) {
            console.error(err);
            return res.json(err);
        }
    }
}

module.exports = ReportingController;