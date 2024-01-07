const ReportingController = require('../controllers/reportingController');

class ReportingRoute {
    static handlePunchDataInOutWeeklyGetRequest(req, res) {
        return null;
        ReportingController.handlePunchDataInOutWeeklyGetRequest(req, res);
    }

    static handlePunchDataInOutMonthlyGetRequest(req, res) {
        return null;
        ReportingController.handlePunchDataInOutMonthlyGetRequest(req, res);
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
    }
];