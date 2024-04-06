const ReportingController = require('../controllers/reportingController');

class ReportingRoute {
    static handlePunchDataInOutWeeklyGetRequest(req, res) {
        ReportingController.handlePunchDataInOutWeeklyGetRequest(req, res);
    }

    static handlePunchDataInOutMonthlyGetRequest(req, res) {
        ReportingController.handlePunchDataInOutMonthlyGetRequest(req, res);
    }

    static handleSendEmailRequest(req, res) {
        ReportingController.triggerEmailPostRequest(req, res);
    }
}

module.exports = [
    {
        path: `/reporting/punch-details-in-out/week`,
        handleGetRequest: ReportingRoute.handlePunchDataInOutWeeklyGetRequest,
    },
    {
        path: `/reporting/punch-details-in-out/month`,
        handleGetRequest: ReportingRoute.handlePunchDataInOutMonthlyGetRequest,
    },
    {
        path: `/reporting/trigger-mail`,
        handlePostRequest: ReportingRoute.handleSendEmailRequest,
    }
];