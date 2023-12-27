const axiosInstance = require('../utils/axiosConfig');
const { format, subDays, parse, differenceInMinutes } = require('date-fns');
const { DOWNLOAD_IN_OUT_PUNCH_DATA } = require('../constants/urls/vendorUrls.js');
const { DEFAULT_IN_OUT_TIME } = require("../constants/enums/employeeEnums.js");
const { getLastSevenFormattedDates, convertArrayOfDatesToEmployeePunchObj } = require("../utils/employeeUtils")
const { EmployeeWeeklyPunchEntity } = require("../constants/models/employee.js");

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

            const apiResponse = response.data;

            if (apiResponse.Error) {
                return res.json(apiResponse)
            }

            // extract atray of punch data
            const arrOfPunchData = apiResponse.InOutPunchData;

            if (Array.isArray(arrOfPunchData) && arrOfPunchData.length) {

                // Create an array to store the formatted dates
                const formattedDates = getLastSevenFormattedDates();

                // create a map to store employee records with id as key and value as a object with name and punch data
                const employeePunchInfo = {};

                arrOfPunchData.forEach((punch) => {
                    if (punch.Empcode in employeePunchInfo) {
                        if (punch.DateString in employeePunchInfo[punch.Empcode].punchData) {
                            employeePunchInfo[punch.Empcode].punchData[punch.DateString].INTime = punch.INTime;
                            employeePunchInfo[punch.Empcode].punchData[punch.DateString].OUTTime = punch.OUTTime;

                            if (punch.INTime && punch.INTime !== DEFAULT_IN_OUT_TIME && punch.OUTTime && punch.OUTTime !== DEFAULT_IN_OUT_TIME) {
                                const date1 = parse(punch.INTime, 'HH:mm', new Date());
                                const date2 = parse(punch.OUTTime, 'HH:mm', new Date());
                                const minutesDifference = differenceInMinutes(date2, date1);
                                employeePunchInfo[punch.Empcode].punchData[punch.DateString].WorkTimeInMins = minutesDifference;
                                employeePunchInfo[punch.Empcode].totalMinsWorked += minutesDifference;
                            } else {
                                employeePunchInfo[punch.Empcode].punchData[punch.DateString].WorkTimeInMins = 0;
                            }
                        }
                    } else {
                        employeePunchInfo[punch.Empcode] = new EmployeeWeeklyPunchEntity(punch.Name, convertArrayOfDatesToEmployeePunchObj(formattedDates))
                        if (punch.DateString in employeePunchInfo[punch.Empcode].punchData) {
                            employeePunchInfo[punch.Empcode].punchData[punch.DateString].INTime = punch.INTime;
                            employeePunchInfo[punch.Empcode].punchData[punch.DateString].OUTTime = punch.OUTTime;

                            if (punch.INTime && punch.INTime !== DEFAULT_IN_OUT_TIME && punch.OUTTime && punch.OUTTime !== DEFAULT_IN_OUT_TIME) {
                                const date1 = parse(punch.INTime, 'HH:mm', new Date());
                                const date2 = parse(punch.OUTTime, 'HH:mm', new Date());
                                const minutesDifference = differenceInMinutes(date2, date1);
                                employeePunchInfo[punch.Empcode].punchData[punch.DateString].WorkTimeInMins = minutesDifference;
                                employeePunchInfo[punch.Empcode].totalMinsWorked += minutesDifference;
                            } else {
                                employeePunchInfo[punch.Empcode].punchData[punch.DateString].WorkTimeInMins = 0;
                            }
                        }
                    }
                })

                return res.render("./reports/weekly", {
                    employeePunchInfo,
                    tableHeaders: formattedDates.map((date) => ({
                        day: format(parse(date, 'dd/MM/yyyy', new Date()), 'EEEE'),
                        date
                    }))
                })
            }

            return res.json(apiResponse)
        } catch (err) {
            console.error(err);
            return res.json(err);
        }
    }
}

module.exports = ReportingController;