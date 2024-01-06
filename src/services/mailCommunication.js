const SibApiV3Sdk = require('@getbrevo/brevo');
const fs = require("fs/promises")
const path = require("path")
const EmployeeUtils = require("../utils/employeeUtils");
const { FILE_EXTENSIONS } = require("../constants/enums/employeeEnums");

class EmailCommunication {

    constructor() {
        this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        this.apiInstance.authentications['apiKey'].apiKey = process.env.BREVO_MAIL_AUTH_KEY;
        this.sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    }

    async sendWeeklyTransacionalMail(startDate, endDate) {
        try {

            const mailConfig = await fs.readFile(path.resolve(__dirname, "..", "constants", "json", `${process.env.NODE_ENV}.json`));
            console.log(mailConfig);
            this.sendSmtpEmail.to = [{ name: "Dibya Mohan", email: 'mohandibya123@gmail.com' }];
            this.sendSmtpEmail.sender = { "name": "Dibya Mohan Acharya", "email": "mohandibya.acharya@gmail.com" };
            this.sendSmtpEmail.subject = 'Email with Attachments - Hello World';
            this.sendSmtpEmail.textContent = 'This email contains a PDF and Excel file as attachments.';

            const pdfFileName = EmployeeUtils.parseWeeklyReportFileName(startDate, endDate, FILE_EXTENSIONS.PDF);
            const excelFileName = EmployeeUtils.parseWeeklyReportFileName(startDate, endDate, FILE_EXTENSIONS.EXCEL);

            const pdfFileData = await fs.readFile(path.resolve(__dirname, "..", "public", "reports", pdfFileName));

            const pdfFileDataBuffer = await Buffer.from(pdfFileData).toString('base64');

            const excelFileData = await fs.readFile(path.resolve(__dirname, "..", "public", "reports", excelFileName));

            const excelFileDataBuffer = await Buffer.from(excelFileData).toString('base64');

            this.sendSmtpEmail.attachment = [
                {
                    content: pdfFileDataBuffer,
                    name: pdfFileName,
                },
                {
                    content: excelFileDataBuffer,
                    name: excelFileName,
                }
            ]
            await this.apiInstance.sendTransacEmail(this.sendSmtpEmail)
        } catch (err) {
            console.error(err);
            throw err
        }
    }
}


module.exports = new EmailCommunication();