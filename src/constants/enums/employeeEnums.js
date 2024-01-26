const DEFAULT_IN_OUT_TIME = "--:--";

const WEEKLY_REPORT_PDF_OPTIONS = {
    "width": "15in",
    "childProcessOptions": {
        "detached": true
    },
    "orientation": "landscape",
    "format": "A4",
    "header": {
        "height": "25mm",
    },
    "footer": {
        "height": "15mm",
    },
    border: {
        top: '10px',
        bottom: '10px',
    },
}


const MONTHLY_REPORT_PDF_OPTIONS = {
    "width": "15in",
    "childProcessOptions": {
        "detached": true
    },
    "orientation": "portrait",
    "format": "A4",
    "header": {
        "height": "25mm",
    },
    "footer": {
        "height": "15mm",
    },
    border: {
        top: '10px',
        bottom: '10px',
    },
}

const FILE_EXTENSIONS = {
    PDF: "pdf",
    EXCEL: "xlsx"
}

const RECEIVING_ENTITY = {
    COMPANY: 'company',
    CLIENT: 'client'
}

// Define named cron jobs
const CRON_JOBS = {
    MONDAY_MORNING: '30 6 * * 1',
    FRIDAY_EVENING: '0 20 * * 5',
    MONTHLY: '0 19 28 * *',
    EVERY_THIRTY_MINS: '*/30 * * * *',
};

const ENCODED_IMAGES = {
    "COMPANY_LOGO": "data:image/png;base64,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",

    "COMPANY_SECONDAY_LOGO": "data:image/png;base64,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"
}

const WEEKLY_MAILING_TEXT_CONTENT = (startDate, endDate, isWeek = true) => `Timesheet for ${isWeek ? ' the week ' : ''}${startDate} to ${endDate}.\n --------------------------------------------- \n \n Powered By TeamOffice \n \n Disclaimer: This email and any files transmitted with it are confidential and intended solely for the use of the individual or entity to whom they are addressed.`


const MONTHLY_MAILING_TEXT_CONTENT = (monthName, year) => `Timesheet for the month ${monthName}, ${year}. \n --------------------------------------------- \n \n Powered By TeamOffice \n \n Disclaimer: This email and any files transmitted with it are confidential and intended solely for the use of the individual or entity to whom they are addressed.`

module.exports = {
    DEFAULT_IN_OUT_TIME,
    WEEKLY_REPORT_PDF_OPTIONS,
    MONTHLY_REPORT_PDF_OPTIONS,
    FILE_EXTENSIONS,
    RECEIVING_ENTITY,
    CRON_JOBS,
    ENCODED_IMAGES,
    WEEKLY_MAILING_TEXT_CONTENT,
    MONTHLY_MAILING_TEXT_CONTENT
}