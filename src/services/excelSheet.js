const { GoogleSpreadsheet } = require('google-spreadsheet');
const creds = require('../config/json/hr-punch-dev-55d9086bc09f.json');
const { JWT } = require('google-auth-library');
const { GOOGLE_SHEET_SCOPES } = require('../constants/enums/employeeEnums');



class ExcelSheetReader {
    static async authenticateUserAndMapExcelData() {
        const serviceAccountAuth = new JWT({
            email: creds.client_email,
            key: creds.private_key,
            scopes: GOOGLE_SHEET_SCOPES
        })

        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];
        const rows = (await sheet.getRows()).map(row => row.toObject());
        return rows.reduce((acc, item) => {
            return {
                ...acc,
                [item.employee_id]: Number(item.charges_per_hour) || 0,
            }
        }, {})
    }
}

module.exports = ExcelSheetReader;