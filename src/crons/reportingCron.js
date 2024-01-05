const cron = require('node-cron');
const { endOfWeek, startOfWeek, subDays } = require("date-fns");
const EmployeePunchService = require("../services/employeePunch");

class ReportingCron {
    static run() {
        // cron to send weekly mails from last week Sunday to Saturday
        cron.schedule('*/30 * * * *', async () => {
            try {

                // Calculate last week's start and end dates
                const today = new Date();
                const lastMonday = subDays(today, 7);
                const startDate = startOfWeek(lastMonday);
                const endDate = endOfWeek(lastMonday);

                await EmployeePunchService.generateWeeklyPunchReportsAndExcel(startDate, endDate);

            } catch (err) {
                console.error(err);
            }
        });
    }
}

module.exports = ReportingCron;