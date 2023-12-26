const ReportingController = require('../controllers/reportingController');

class ReportingRoute {
    static handleGetRequest(req, res) {
        ReportingController.handleGetRequest(req, res);
    }
}

module.exports = [
    {
        path: `/reporting`,
        handleGetRequest: ReportingRoute.handleGetRequest,
    },
];