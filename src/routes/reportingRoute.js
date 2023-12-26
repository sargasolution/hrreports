const ReportingController = require('../controllers/reportingController');

class ReportingRoute {
    static handlePunchDataInOutGetRequest(req, res) {
        ReportingController.handlePunchDataInOutGetRequest(req, res);
    }
}

module.exports = [
    {
        path: `/reporting/punch-details-in-out`,
        handleGetRequest: ReportingRoute.handlePunchDataInOutGetRequest,
    }
];