const DEFAULT_IN_OUT_TIME = "--:--";

const WEEKLY_REPORT_PDF_OPTIONS = {
    "width": "15in",
    "childProcessOptions": {
        "detached": true
    },
    "orientation": "landscape",
    "format": "A4",
    "header": {
        "height": "15mm",
    },
    "footer": {
        "height": "15mm",
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
        "height": "15mm",
    },
    "footer": {
        "height": "15mm",
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
    MONDAY_MORNING: '0 30 5 * * 1',
    FRIDAY_EVENING: '0 18 * * 5',
    MONTHLY: '0 19 28 * *',
    EVERY_THIRTY_MINS: '*/30 * * * *',
};

module.exports = {
    DEFAULT_IN_OUT_TIME,
    WEEKLY_REPORT_PDF_OPTIONS,
    MONTHLY_REPORT_PDF_OPTIONS,
    FILE_EXTENSIONS,
    RECEIVING_ENTITY,
    CRON_JOBS
}