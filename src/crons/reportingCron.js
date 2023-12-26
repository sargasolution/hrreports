const cron = require('node-cron');


class ReportingCron {
    static run() {
        cron.schedule('*/5 * * * *', () => {
            console.log('Running cron job every 5 minutes');
        });
    }
}

module.exports = ReportingCron;