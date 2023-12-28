const fsp = require('fs/promises');
// const fs = require('fs');
const ejs = require('ejs');
const pdf = require('html-pdf');


async function generatePdf(templatePath, templateData, outputPdfPath, pdfOptions) {
    try {
        const templateContent = await fsp.readFile(templatePath, { encoding: 'utf-8' });

        // Render the EJS template with data
        const renderedHtml = ejs.render(templateContent, templateData);

        // Generate PDF from the rendered HTML
        const pdfPromise = new Promise((resolve, reject) => {
            pdf.create(renderedHtml, pdfOptions).toFile(outputPdfPath, (pdfErr, res) => {
                if (pdfErr) {
                    reject(pdfErr);
                } else {
                    resolve(res);
                }
            });
        });

        await pdfPromise;

    } catch (err) {
        throw err;
    }
}


module.exports = {
    generatePdf
}