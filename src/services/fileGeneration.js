const fsp = require('fs/promises');
const ejs = require('ejs');
const pdf = require('html-pdf');
const excel = require('exceljs');



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


async function generateXlsx(excelGenerationData, outputExcelPath, excelConfig = {}) {
    try {
        // Create a new Excel workbook and worksheet
        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet(excelConfig?.sheetName);

        worksheet.columns = excelConfig?.columns || [];
        worksheet.addRows(excelGenerationData);

        // Save the XLSX data to a file
        await workbook.xlsx.writeFile(outputExcelPath);

    } catch (err) {
        throw err;
    }
}


module.exports = {
    generatePdf,
    generateXlsx
}