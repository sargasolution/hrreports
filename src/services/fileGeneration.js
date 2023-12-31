const fsp = require('fs/promises');
const ejs = require('ejs');
const pdf = require('html-pdf');
const excel = require('exceljs');
const { format, parse } = require('date-fns')



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


async function generateMonthlyXlsx(excelGenerationData, outputExcelPath, excelConfig = {}) {
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


async function generateWeeklyXlsx(excelGenerationData, outputExcelPath, excelConfig = {}) {
    try {
        // Create a new Excel workbook and worksheet
        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet(excelConfig?.sheetName);

        const dateColumnHeaders = excelConfig?.datesList || [];

        // Define date column headers
        const columnsHeaders = [
            'Employee Name',
            ...dateColumnHeaders,
            'Total Hrs'
        ];

        // Add date column headers to the worksheet
        worksheet.addRow(columnsHeaders);

        // Merge the cells for the date column headers
        columnsHeaders.forEach((dateHeader, index, arr) => {

            if (index == 0) {
                worksheet.mergeCells(1, 1, 2, 1);
                worksheet.getCell(1, 1).alignment = { vertical: "middle" }
            }

            // Skip the first column as it's "Employee Name"
            if (index > 0) {
                const startCol = (index - 1) * 3 + 2; // Starting column for the current date
                const cell = worksheet.getCell(1, startCol);
                cell.value = dateHeader; // Set the merged cell value

                // Set the attributes only for date headers
                if (index < arr.length - 1) {
                    cell.value = `${dateHeader} \n ${format(parse(dateHeader, 'dd/MM/yyyy', new Date()), 'EEEE')}`;
                    const endCol = startCol + 2;   // Ending column for the current date
                    worksheet.mergeCells(1, startCol, 1, endCol);
                    cell.alignment = { horizontal: 'center' };  // Center align the text
                    worksheet.getCell(2, startCol).value = 'IN';       // Set IN sub-column header
                    worksheet.getCell(2, startCol + 1).value = 'OUT';  // Set OUT sub-column header
                    worksheet.getCell(2, startCol + 2).value = 'Hrs';  // Set Hrs sub-column header
                    worksheet.getCell(2, startCol).font = { bold: true };
                    worksheet.getCell(2, startCol + 1).font = { bold: true };
                    worksheet.getCell(2, startCol + 2).font = { bold: true };
                } else {
                    worksheet.mergeCells(1, startCol, 2, startCol);
                    worksheet.getCell(1, startCol).alignment = { vertical: "middle" }
                }
            }
        });


        // Set font style for the header row to make it bold
        const headerRow = worksheet.getRow(1);
        headerRow.font = {
            bold: true
        };
        // Set width for the "Employee Name" column
        worksheet.getColumn(1).width = 25;

        const employeeData = [
            ...Object.values(excelGenerationData)
        ];

        // Add data to the worksheet
        employeeData.forEach(employee => {
            const rowData = [employee.name]; // Total Hrs column placeholder

            // Loop through each date
            for (let punchDate of dateColumnHeaders) {
                const dateData = employee.punchData[punchDate];
                // Add IN, OUT, Hrs for each date
                rowData.push(dateData.INTime, dateData.OUTTime, dateData.WorkTimeInMinsShow);
            }

            // Add Total Hrs
            rowData.push(employee.totalMinsWorkedShow);

            // Add the row to the worksheet
            worksheet.addRow(rowData);
        });

        // Save the Excel file
        await workbook.xlsx.writeFile(outputExcelPath);

    } catch (err) {
        throw err;
    }
}


module.exports = {
    generatePdf,
    generateMonthlyXlsx,
    generateWeeklyXlsx
}