const cron = require('node-cron');
const { endOfWeek, startOfWeek, subDays } = require("date-fns");
const EmployeePunchService = require("../services/employeePunch");
const EmailCommunication = require("../services/mailCommunication");
const logger = require("../config/logger");


class ReportingCron {
    static run() {
        // cron to send weekly mails from last week Sunday to Saturday
        cron.schedule('0 30 5 * * 1', async () => {
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
                logger.warn("Weekly client cron failed");
                logger.error(err);
            }
        });
    }
}

module.exports = ReportingCron;