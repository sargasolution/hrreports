const SibApiV3Sdk = require('@getbrevo/brevo');
const fs = require("fs/promises")
const path = require("path")
const EmployeeUtils = require("../utils/employeeUtils");
const { FILE_EXTENSIONS, WEEKLY_MAILING_TEXT_CONTENT, MONTHLY_MAILING_TEXT_CONTENT, CUSTOM_MAILING_TEXT_CONTENT } = require("../constants/enums/employeeEnums");
const logger = require('../config/logger');
const { format, getYear } = require("date-fns");

class EmailCommunication {

    constructor() {
        this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        this.apiInstance.authentications['apiKey'].apiKey = process.env.BREVO_MAIL_AUTH_KEY;
    }

    async sendWeeklyTransacionalMailToClient(startDate, endDate, forceSendDev = false) {
        try {

            // extract mailimg options from json
            const mailConfigBuffer = await fs.readFile(path.resolve(__dirname, "..", "constants", "json", `${forceSendDev ? 'development' : process.env.NODE_ENV}.json`), 'utf8');
            const mailConfig = JSON.parse(mailConfigBuffer);
            const weeklyMailingOptions = mailConfig["weeklyMailingOptions"]

            const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

            // associate options to email body
            sendSmtpEmail.sender = weeklyMailingOptions["sender"];

            if (Array.isArray(weeklyMailingOptions["to"]) && weeklyMailingOptions["to"]?.length) {
                sendSmtpEmail.to = weeklyMailingOptions["to"];
            }

            if (Array.isArray(weeklyMailingOptions["cc"]) && weeklyMailingOptions["cc"].length) {
                sendSmtpEmail.cc = weeklyMailingOptions["cc"];
            }

            const formattedStartDate = format(startDate, "MM/dd/yyyy");
            const formattedEndDate = format(endDate, "MM/dd/yyyy");

            sendSmtpEmail.textContent = WEEKLY_MAILING_TEXT_CONTENT(formattedStartDate, formattedEndDate);

            sendSmtpEmail.subject = `Weekly Timesheet - ${formattedStartDate} to ${formattedEndDate} `;

            // extract pdf file name
            const pdfFileName = EmployeeUtils.parseWeeklyReportFileName(startDate, endDate, FILE_EXTENSIONS.PDF);

            // read data from pdf file at the destination path
            const pdfFileData = await fs.readFile(path.resolve(__dirname, "..", "public", "reports", pdfFileName));

            // convert buffer to proper format
            const pdfFileDataBuffer = await Buffer.from(pdfFileData).toString('base64');

            if (pdfFileData) {
                sendSmtpEmail.attachment = [
                    {
                        content: pdfFileDataBuffer,
                        name: pdfFileName,
                    }
                ];
                await this.apiInstance.sendTransacEmail(sendSmtpEmail);
            } else {
                throw new Error("No excel data could be read")
            }

        } catch (err) {
            logger.error(err);
            throw err
        }
    }

    async sendWeeklyTransacionalMailToCompany(startDate, endDate, forceSendDev = false) {
        try {
            // extract mailimg options from json
            const mailConfigBuffer = await fs.readFile(path.resolve(__dirname, "..", "constants", "json", `${forceSendDev ? 'development' : process.env.NODE_ENV}.json`), 'utf8');
            const mailConfig = JSON.parse(mailConfigBuffer);
            const fridayMailingOptions = mailConfig["fridayMailingOptions"]

            const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

            // associate options to email body
            sendSmtpEmail.sender = fridayMailingOptions["sender"];

            if (Array.isArray(fridayMailingOptions["to"]) && fridayMailingOptions["to"].length) {
                sendSmtpEmail.to = fridayMailingOptions["to"];
            }

            if (Array.isArray(fridayMailingOptions["cc"]) && fridayMailingOptions["cc"].length) {
                sendSmtpEmail.cc = fridayMailingOptions["cc"];
            }

            const formattedStartDate = format(startDate, "MM/dd/yyyy");
            const formattedEndDate = format(endDate, "MM/dd/yyyy");

            sendSmtpEmail.textContent = WEEKLY_MAILING_TEXT_CONTENT(formattedStartDate, formattedEndDate);

            sendSmtpEmail.subject = `Weekly Timesheet - ${formattedStartDate} to ${formattedEndDate} `;

            // extract pdf file name
            const pdfFileName = EmployeeUtils.parseWeeklyReportFileName(startDate, endDate, FILE_EXTENSIONS.PDF);
            // read data from pdf file at the destination path
            const pdfFileData = await fs.readFile(path.resolve(__dirname, "..", "public", "reports", pdfFileName));
            // convert buffer to proper format
            const pdfFileDataBuffer = await Buffer.from(pdfFileData).toString('base64');

            // extract excel file name
            const excelFileName = EmployeeUtils.parseWeeklyReportFileName(startDate, endDate, FILE_EXTENSIONS.EXCEL);
            // read data from excel file at the destination path
            const excelFileData = await fs.readFile(path.resolve(__dirname, "..", "public", "reports", excelFileName));
            // convert buffer to proper format
            const excelFileDataBuffer = await Buffer.from(excelFileData).toString('base64');

            if (pdfFileData && excelFileData) {
                sendSmtpEmail.attachment = [
                    {
                        content: excelFileDataBuffer,
                        name: excelFileName,
                    },
                    {
                        content: pdfFileDataBuffer,
                        name: pdfFileName
                    }
                ];
                await this.apiInstance.sendTransacEmail(sendSmtpEmail);
            } else {
                throw new Error("No excel and PDF data could be read")
            }

        } catch (err) {
            logger.error(err);
            throw err
        }
    }

    async sendMonthlyTransactionMailToCompany(startDate, endDate, forceSendDev = false) {
        try {
            // extract mailimg options from json
            const mailConfigBuffer = await fs.readFile(path.resolve(__dirname, "..", "constants", "json", `${forceSendDev ? 'development' : process.env.NODE_ENV}.json`), 'utf8');
            const mailConfig = JSON.parse(mailConfigBuffer);
            const monthlyMailingOptions = mailConfig["monthlyMailingOptions"]

            const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()

            // associate options to email body
            sendSmtpEmail.sender = monthlyMailingOptions["sender"];

            if (Array.isArray(monthlyMailingOptions["to"]) && monthlyMailingOptions["to"].length) {
                sendSmtpEmail.to = monthlyMailingOptions["to"];
            }

            if (Array.isArray(monthlyMailingOptions["cc"]) && monthlyMailingOptions["cc"].length) {
                sendSmtpEmail.cc = monthlyMailingOptions["cc"];
            }

            const formattedMonthName = format(endDate, "MMM");
            const formattedYear = getYear(endDate);

            sendSmtpEmail.textContent = MONTHLY_MAILING_TEXT_CONTENT(formattedMonthName, formattedYear);

            sendSmtpEmail.subject = `Monthly Timesheet - ${formattedMonthName}, ${formattedYear}`;

            // extract pdf file name
            const pdfFileName = EmployeeUtils.parseMonthlyReportFileName(endDate, FILE_EXTENSIONS.PDF);

            // read data from pdf file at the destination path
            const pdfFileData = await fs.readFile(path.resolve(__dirname, "..", "public", "reports", pdfFileName));

            // convert buffer to proper format
            const pdfFileDataBuffer = await Buffer.from(pdfFileData).toString('base64');

            // extract excel file name
            const excelFileName = EmployeeUtils.parseMonthlyReportFileName(endDate, FILE_EXTENSIONS.EXCEL);

            // read data from excel file at the destination path
            const excelFileData = await fs.readFile(path.resolve(__dirname, "..", "public", "reports", excelFileName));

            // convert buffer to proper format
            const excelFileDataBuffer = await Buffer.from(excelFileData).toString('base64');

            if (pdfFileData && excelFileData) {
                sendSmtpEmail.attachment = [
                    {
                        content: excelFileDataBuffer,
                        name: excelFileName,
                    },
                    {
                        content: pdfFileDataBuffer,
                        name: pdfFileName
                    }
                ];
                await this.apiInstance.sendTransacEmail(sendSmtpEmail);
            } else {
                throw new Error("No excel and PDF data could be read")
            }

        } catch (err) {
            logger.error(err);
            throw err
        }
    }

    async sendCustomMailToCompany(message, forceSendDev = false) {
        const mailContent = CUSTOM_MAILING_TEXT_CONTENT(message);

        // extract mailimg options from json
        const mailConfigBuffer = await fs.readFile(path.resolve(__dirname, "..", "constants", "json", `${forceSendDev ? 'development' : process.env.NODE_ENV}.json`), 'utf8');
        const mailConfig = JSON.parse(mailConfigBuffer);
        const customMailingOptions = mailConfig["customMessageMailingOptions"]

        // associate options to email body
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()
        sendSmtpEmail.sender = customMailingOptions["sender"];

        if (Array.isArray(customMailingOptions["bcc"]) && customMailingOptions["bcc"].length) {
            sendSmtpEmail.bcc = customMailingOptions["bcc"];
        }

        sendSmtpEmail.subject = `India Office HOLIDAY NOTICE`;

        sendSmtpEmail.textContent = mailContent;

        await this.apiInstance.sendTransacEmail(sendSmtpEmail);
    }
}


module.exports = new EmailCommunication();