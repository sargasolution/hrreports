const cron = require('node-cron');
const { endOfWeek, startOfWeek, subDays, startOfMonth, subWeeks } = require("date-fns");
const EmployeePunchService = require("../services/employeePunch");
const EmailCommunication = require("../services/mailCommunication");
const logger = require("../config/logger");
const { CRON_JOBS } = require("../constants/enums/employeeEnums");
const cronitor = require('cronitor')(process.env.CRONITOR_API_KEY, {
    environment: process.env.NODE_ENV
});
cronitor.wraps(cron);


class ReportingCron {
    static run() {
        // cron to send weekly mails from last week Sunday to Saturday
        cronitor.schedule("Monday Morning Cron", CRON_JOBS.MONDAY_MORNING, async () => {
            try {
                logger.info("Weekly client cron started.");

                // Calculate last week's start and end dates
                const today = new Date();
                const startOfLastWeek = subWeeks(startOfWeek(today), 1);
                // Calculate the date of last week's Friday
                let endDate = null;
                if (today.getDay() === 1) {
                    endDate = subDays(today, 3);
                } else {
                    endDate = subWeeks(endOfWeek(today), 1); // Otherwise, it's the end of last week
                }
                // Calculate the date of last last week's Saturday
                const startDate = subDays(startOfLastWeek, 1);

                await EmployeePunchService.generateWeeklyPunchReportsAndExcel(startDate, endDate);
                await EmailCommunication.sendWeeklyTransacionalMailToClient(startDate, endDate);

                logger.info("Weekly client cron ended successfully");

            } catch (err) {
                logger.error("Weekly client cron failed");
                logger.error(err);
            }
        }, {
            runOnInit: false,
            timezone: 'Asia/Kolkata'
        });



        // cron to send weekly mails from last week Saturday to Friday
        cronitor.schedule("Friday Evening Cron", CRON_JOBS.FRIDAY_EVENING, async () => {
            try {
                logger.info("Friday company cron started.");

                // Calculate last week's start and end dates
                const today = new Date();
                const endDate = today;
                const startDate = endOfWeek(subDays(endDate, 6));

                await EmployeePunchService.generateWeeklyPunchReportsAndExcel(startDate, endDate);
                await EmailCommunication.sendWeeklyTransacionalMailToCompany(startDate, endDate);

                logger.info("Friday company cron ended successfully");

            } catch (err) {
                logger.error("Friday company cron failed");
                logger.error(err);
            }
        }, {
            runOnInit: false,
            timezone: 'Asia/Kolkata'
        });



        // cron to send monthly mails to company
        cronitor.schedule("Monthly Cron", CRON_JOBS.MONTHLY, async () => {
            try {
                logger.info("Monthly company cron started.");

                // Calculate last week's start and end dates
                const today = new Date();
                const endDate = today;
                const startDate = startOfMonth(endDate);

                await EmployeePunchService.generateMonthlyReportAndExcel(startDate, endDate);
                await EmailCommunication.sendMonthlyTransactionMailToCompany(startDate, endDate);

                logger.info("Monthly company cron ended successfully");

            } catch (err) {
                logger.error("Monthly company cron failed");
                logger.error(err);
            }
        }, {
            runOnInit: false,
            timezone: 'Asia/Kolkata'
        });
    }
}

module.exports = ReportingCron;