const axiosInstance = require('../utils/axiosConfig');
const { DOWNLOAD_IN_OUT_PUNCH_DATA } = require('../constants/urls/vendorUrls.js');

class VendorApiService {
    // startDate and endDate is of "dd/MM/yyyy" format
    static async fetchPunchData(startDate, EndDate, empCode = 'ALL') {
        try {
            const response = await axiosInstance.get(DOWNLOAD_IN_OUT_PUNCH_DATA, {
                params: {
                    Empcode: empCode,
                    FromDate: startDate,
                    ToDate: EndDate
                }
            })
            const apiResponse = response.data;
            return apiResponse;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = VendorApiService;