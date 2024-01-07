const ReportingController = require('../controllers/reportingController');

class ReportingRoute {
    static handlePunchDataInOutWeeklyGetRequest(req, res) {
        return res.json({
            message: "Not in service"
        });
        ReportingController.handlePunchDataInOutWeeklyGetRequest(req, res);
    }

    static handlePunchDataInOutMonthlyGetRequest(req, res) {
        return res.json({
            message: "Not in service"
        });
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