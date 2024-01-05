const SibApiV3Sdk = require('@getbrevo/brevo');
const fs = require("fs")
const path = require("path")

class EmailCommunication {

    constructor() {
        this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        this.apiInstance.authentications['apiKey'].apiKey = process.env.BREVO_MAIL_AUTH_KEY;
        this.sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    }

    async sendWeeklyTransacionalMail() {
        try {
            this.sendSmtpEmail.to = [{ name: "Dibya Mohan", email: 'mohandibya123@gmail.com' }];
            this.sendSmtpEmail.sender = { "name": "Dibya Mohan Acharya", "email": "mohandibya.acharya@gmail.com" };
            this.sendSmtpEmail.subject = 'Email with Attachments - Hello World';
            this.sendSmtpEmail.textContent = 'This email contains a PDF and Excel file as attachments.';

            const pdfFileData = fs.readFileSync(path.resolve(__dirname, "..", "public", "reports", "output_weekly.pdf"));

            const pdfFileDataBuffer = await Buffer.from(pdfFileData).toString('base64');

            const excelFileData = fs.readFileSync(path.resolve(__dirname, "..", "public", "reports", "output_weekly.xlsx"));

            const excelFileDataBuffer = await Buffer.from(excelFileData).toString('base64');

            this.sendSmtpEmail.attachment = [
                {
                    content: pdfFileDataBuffer,
                    name: 'output_weekly.pdf',
                },
                {
                    content: excelFileDataBuffer,
                    name: 'output_weekly.xlsx',
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