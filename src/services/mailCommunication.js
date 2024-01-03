const SibApiV3Sdk = require('@getbrevo/brevo');
const fs = require("fs")
const path = require("path")

class EmailCommunication {
    static async sendTransacionalMail() {
        try {
            let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
            let apiKey = apiInstance.authentications['apiKey'];
            apiKey.apiKey = process.env.BREVO_MAIL_AUTH_KEY;
            let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

            sendSmtpEmail.to = [{ name: "Dibya Mohan", email: 'mohandibya.acharya@gmail.com' }];
            sendSmtpEmail.sender = { "name": "Dibya Mohan Acharya", "email": "mohandibya123@gmail.com" };
            sendSmtpEmail.subject = 'Email with Attachments - Hello World';
            sendSmtpEmail.textContent = 'This email contains a PDF and Excel file as attachments.';

            const pdfFileData = fs.readFileSync(path.resolve(__dirname, "..", "public", "reports", "output_weekly.pdf"));

            const pdfFileDataBuffer = await Buffer.from(pdfFileData).toString('base64');

            const excelFileData = fs.readFileSync(path.resolve(__dirname, "..", "public", "reports", "output_weekly.xlsx"));

            const excelFileDataBuffer = await Buffer.from(excelFileData).toString('base64');

            sendSmtpEmail.attachment = [
                {
                    content: pdfFileDataBuffer,
                    name: 'output_weekly.pdf',
                },
                {
                    content: excelFileDataBuffer,
                    name: 'output_weekly.xlsx',
                }
            ]
            await apiInstance.sendTransacEmail(sendSmtpEmail)
        } catch (err) {
            console.error(err);
            throw err
        }

    }
}


module.exports = EmailCommunication;