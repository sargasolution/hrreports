const { subDays, startOfMonth, startOfWeek, endOfWeek } = require('date-fns');
const EmployeePunchService = require("../services/employeePunch");
const EmailCommunication = require("../services/mailCommunication");
const logger = require('../config/logger.js');

class ReportingController {
    static async handlePunchDataInOutWeeklyGetRequest(req, res) {
        try {
            let startDate = req.query.startDate;
            let endDate = req.query.endDate;
            if (!startDate || !endDate) {
                const today = new Date();
                const lastMonday = subDays(today, 7);
                startDate = startOfWeek(lastMonday);
                endDate = endOfWeek(lastMonday);
            }

            await EmployeePunchService.generateWeeklyPunchReportsAndExcel(startDate, endDate);
            await EmailCommunication.sendWeeklyTransacionalMailToClient(startDate, endDate);

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
            logger.error(err);
            return res.json(err);
        }
    }


    static async handlePunchDataInOutMonthlyGetRequest(req, res) {
        try {

            const today = new Date();
            const startOfCurrentMonth = startOfMonth(today);

            await EmployeePunchService.generateMonthlyReportAndExcel(startOfCurrentMonth, today);
            await EmailCommunication.sendMonthlyTransactionMailToCompany(startOfCurrentMonth, today);


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
            return res.json(err);
        }
    }
}

module.exports = ReportingController;