const cron = require('node-cron');
const { endOfWeek, startOfWeek, subDays, format, startOfMonth } = require("date-fns");
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
                const lastMonday = subDays(today, 7);
                const startDate = startOfWeek(lastMonday);
                const endDate = endOfWeek(lastMonday);

                await EmployeePunchService.generateWeeklyPunchReportsAndExcel(startDate, endDate);
                await EmailCommunication.sendWeeklyTransacionalMailToClient(startDate, endDate);

                logger.info("Weekly client cron ended successfully");

            } catch (err) {
                logger.error("Weekly client cron failed");
                logger.error(err);
            }
        }, {
            runOnInit: false
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
            runOnInit: false
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
            runOnInit: false
        });
    }
}

module.exports = ReportingCron;