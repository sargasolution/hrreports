const axiosInstance = require('../utils/axiosConfig');
const { format, subDays } = require('date-fns');
const { DOWNLOAD_IN_OUT_PUNCH_DATA } = require('../constants/urls/vendorUrls.js');

class ReportingController {
    static async handlePunchDataInOutGetRequest(req, res) {
        try {
            const today = new Date();
            const sevenDaysAgo = subDays(today, 6);

            const response = await axiosInstance.get(DOWNLOAD_IN_OUT_PUNCH_DATA, {
                params: {
                    Empcode: 'ALL',
                    FromDate: format(sevenDaysAgo, 'dd/MM/yyyy'),
                    ToDate: format(today, 'dd/MM/yyyy')
                }
            })
            console.log(response.data);

            return res.render("./reports/weekly.ejs", {})
        } catch (err) {
            console.error(err);
            return res.end(err);
        }
    }
}

module.exports = ReportingController;