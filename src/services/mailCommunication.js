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
        this.sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    }

    async sendWeeklyTransacionalMailToClient(startDate, endDate, forceSendDev = false) {
        try {

            // extract mailimg options from json
            const mailConfigBuffer = await fs.readFile(path.resolve(__dirname, "..", "constants", "json", `${forceSendDev ? 'development' : process.env.NODE_ENV}.json`), 'utf8');
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

            const formattedStartDate = format(startDate, "MM/dd/yyyy");
            const formattedEndDate = format(endDate, "MM/dd/yyyy");

            this.sendSmtpEmail.textContent = WEEKLY_MAILING_TEXT_CONTENT(formattedStartDate, formattedEndDate);

            this.sendSmtpEmail.subject = `Weekly Timesheet - ${formattedStartDate} to ${formattedEndDate} `;

            // extract pdf file name
            const pdfFileName = EmployeeUtils.parseWeeklyReportFileName(startDate, endDate, FILE_EXTENSIONS.PDF);

            // read data from pdf file at the destination path
            const pdfFileData = await fs.readFile(path.resolve(__dirname, "..", "public", "reports", pdfFileName));

            // convert buffer to proper format
            const pdfFileDataBuffer = await Buffer.from(pdfFileData).toString('base64');

            if (pdfFileData) {
                this.sendSmtpEmail.attachment = [
                    {
                        content: pdfFileDataBuffer,
                        name: pdfFileName,
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

    async sendWeeklyTransacionalMailToCompany(startDate, endDate, forceSendDev = false) {
        try {
            // extract mailimg options from json
            const mailConfigBuffer = await fs.readFile(path.resolve(__dirname, "..", "constants", "json", `${forceSendDev ? 'development' : process.env.NODE_ENV}.json`), 'utf8');
            const mailConfig = JSON.parse(mailConfigBuffer);
            const fridayMailingOptions = mailConfig["fridayMailingOptions"]

            // associate options to email body
            this.sendSmtpEmail.sender = fridayMailingOptions["sender"];

            if (Array.isArray(fridayMailingOptions["to"]) && fridayMailingOptions["to"].length) {
                this.sendSmtpEmail.to = fridayMailingOptions["to"];
            }

            if (Array.isArray(fridayMailingOptions["cc"]) && fridayMailingOptions["cc"].length) {
                this.sendSmtpEmail.cc = fridayMailingOptions["cc"];
            }

            const formattedStartDate = format(startDate, "MM/dd/yyyy");
            const formattedEndDate = format(endDate, "MM/dd/yyyy");

            this.sendSmtpEmail.textContent = WEEKLY_MAILING_TEXT_CONTENT(formattedStartDate, formattedEndDate);

            this.sendSmtpEmail.subject = `Weekly Timesheet - ${formattedStartDate} to ${formattedEndDate} `;

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
                this.sendSmtpEmail.attachment = [
                    {
                        content: excelFileDataBuffer,
                        name: excelFileName,
                    },
                    {
                        content: pdfFileDataBuffer,
                        name: pdfFileName
                    }
                ];
                await this.apiInstance.sendTransacEmail(this.sendSmtpEmail);
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

            // associate options to email body
            this.sendSmtpEmail.sender = monthlyMailingOptions["sender"];

            if (Array.isArray(monthlyMailingOptions["to"]) && monthlyMailingOptions["to"].length) {
                this.sendSmtpEmail.to = monthlyMailingOptions["to"];
            }

            if (Array.isArray(monthlyMailingOptions["cc"]) && monthlyMailingOptions["cc"].length) {
                this.sendSmtpEmail.cc = monthlyMailingOptions["cc"];
            }

            const formattedMonthName = format(endDate, "MMM");
            const formattedYear = getYear(endDate);

            this.sendSmtpEmail.textContent = MONTHLY_MAILING_TEXT_CONTENT(formattedMonthName, formattedYear);

            this.sendSmtpEmail.subject = `Monthly Timesheet - ${formattedMonthName}, ${formattedYear}`;

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
                this.sendSmtpEmail.attachment = [
                    {
                        content: excelFileDataBuffer,
                        name: excelFileName,
                    },
                    {
                        content: pdfFileDataBuffer,
                        name: pdfFileName
                    }
                ];
                await this.apiInstance.sendTransacEmail(this.sendSmtpEmail);
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
        this.sendSmtpEmail.sender = customMailingOptions["sender"];

        if (Array.isArray(customMailingOptions["to"]) && customMailingOptions["to"].length) {
            this.sendSmtpEmail.to = customMailingOptions["to"];
        }

        if (Array.isArray(customMailingOptions["bcc"]) && customMailingOptions["bcc"].length) {
            this.sendSmtpEmail.bcc = customMailingOptions["bcc"];
        }

        this.sendSmtpEmail.subject = `India Office HOLIDAY NOTICE`;

        this.sendSmtpEmail.textContent = mailContent;

        await this.apiInstance.sendTransacEmail(this.sendSmtpEmail);
    }
}


module.exports = new EmailCommunication();