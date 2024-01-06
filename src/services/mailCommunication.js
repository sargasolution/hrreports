const SibApiV3Sdk = require('@getbrevo/brevo');
const fs = require("fs/promises")
const path = require("path")
const EmployeeUtils = require("../utils/employeeUtils");
const { FILE_EXTENSIONS } = require("../constants/enums/employeeEnums");
const logger = require('../config/logger');
const { format } = require("date-fns");

class EmailCommunication {

    constructor() {
        this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        this.apiInstance.authentications['apiKey'].apiKey = process.env.BREVO_MAIL_AUTH_KEY;
        this.sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    }

    async sendWeeklyTransacionalMailToClient(startDate, endDate) {
        try {

            // extract mailimg options from json
            const mailConfigBuffer = await fs.readFile(path.resolve(__dirname, "..", "constants", "json", `${process.env.NODE_ENV}.json`), 'utf8');
            const mailConfig = JSON.parse(mailConfigBuffer);
            const weeklyMailingOptions = mailConfig["weeklyMailingOptions"]

            // associate options to email body
            this.sendSmtpEmail.sender = weeklyMailingOptions["sender"];

            if (Array.isArray(weeklyMailingOptions["to"]) && weeklyMailingOptions["to"]?.length) {
                this.sendSmtpEmail.to = weeklyMailingOptions["to"];
            }

            if (Array.isArray(weeklyMailingOptions["cc"]) && weeklyMailingOptions["cc"].length) {
                this.sendSmtpEmail.cc = weeklyMailingOptions["cc"];
            }

            this.sendSmtpEmail.textContent = weeklyMailingOptions["textContent"] || ".";
            this.sendSmtpEmail.subject = `Weekly Time Management - ${format(startDate, "dd/MM/yyyy")} to ${format(endDate, "dd/MM/yyyy")} `;

            // const pdfFileName = EmployeeUtils.parseWeeklyReportFileName(startDate, endDate, FILE_EXTENSIONS.PDF);
            // const pdfFileData = await fs.readFile(path.resolve(__dirname, "..", "public", "reports", pdfFileName));
            // const pdfFileDataBuffer = await Buffer.from(pdfFileData).toString('base64');

            // extract excel file name
            const excelFileName = EmployeeUtils.parseWeeklyReportFileName(startDate, endDate, FILE_EXTENSIONS.EXCEL);
            // read data from excel file at the destination path
            const excelFileData = await fs.readFile(path.resolve(__dirname, "..", "public", "reports", excelFileName));
            // convert buffer to proper format
            const excelFileDataBuffer = await Buffer.from(excelFileData).toString('base64');

            if (excelFileDataBuffer) {
                this.sendSmtpEmail.attachment = [
                    {
                        content: excelFileDataBuffer,
                        name: excelFileName,
                    }
                ];
                await this.apiInstance.sendTransacEmail(this.sendSmtpEmail);
            } else {
                throw new Error("No excel data could be read")
            }

        } catch (err) {
            logger.error(err);
            throw err
        }
    }
}


module.exports = new EmailCommunication();