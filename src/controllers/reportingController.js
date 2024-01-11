const { startOfMonth, parse } = require('date-fns');
const EmployeePunchService = require("../services/employeePunch");
const EmailCommunication = require("../services/mailCommunication");
const logger = require('../config/logger.js');
const EmployeeUtils = require("../utils/employeeUtils");

class ReportingController {
    static async handlePunchDataInOutWeeklyGetRequest(req, res) {
        try {
            let { startDate, endDate, forceSendDev } = req.query;

            if (!startDate || !endDate) {
                throw new Error("PLease provide parameters startDate and endDate");
            }

            if (!EmployeeUtils.isValidDateFormat(startDate)) {
                throw new Error("Please enter valid startDate format 'dd/MM/yyyy'");
            }

            if (!EmployeeUtils.isValidDateFormat(endDate)) {
                throw new Error("Please enter valid endDate format 'dd/MM/yyyy'");
            }


            const parsedStartDate = parse(startDate, 'dd/MM/yyyy', new Date());
            const parsedEndDate = parse(endDate, 'dd/MM/yyyy', new Date());

            if (parsedStartDate > parsedEndDate) {
                throw new Error('startDate should not be later than endDate.');
            }

            const daysDiff = EmployeeUtils.daysDifference(parsedEndDate, parsedStartDate);

            if (daysDiff < 0 || daysDiff > 7) {
                throw new Error(`The difference between startDate and endDate should not be more than 7 days.`)
            }

            await EmployeePunchService.generateWeeklyPunchReportsAndExcel(parsedStartDate, parsedEndDate);
            await EmailCommunication.sendWeeklyTransacionalMailToCompany(parsedStartDate, parsedEndDate, forceSendDev);

            return res.json({
                "Error": false,
                "Msg": "Pdf and Excel sheet generated successfully",
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
            logger.error(err);
            return res.status(400).json({
                Msg: err?.message || "Failed to execute the API",
                Error: true
            });
        }
    }


    static async handlePunchDataInOutMonthlyGetRequest(req, res) {
        try {

            const { forceSendDev } = req.query;

            const endDate = new Date();
            const startDate = startOfMonth(endDate);

            await EmployeePunchService.generateMonthlyReportAndExcel(startDate, endDate);
            await EmailCommunication.sendMonthlyTransactionMailToCompany(startDate, endDate, forceSendDev);


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

        } catch (err) {
            logger.error(err);
            return res.status(400).json({
                Msg: err?.message || "Failed to execute the API",
                Error: true
            });
        }
    }
}

module.exports = ReportingController;