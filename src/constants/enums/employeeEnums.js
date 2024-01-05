const DEFAULT_IN_OUT_TIME = "--:--";

const WEEKLY_REPORT_PDF_OPTIONS = {
    "width": "15in",
    "childProcessOptions": {
        "detached": true
    },
    "orientation": "landscape",
    "format": "A4",
    "header": {
        "height": "4mm",
    },
    "footer": {
        "height": "4mm",
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
        "height": "4mm",
    },
    "footer": {
        "height": "4mm",
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

module.exports = {
    DEFAULT_IN_OUT_TIME,
    WEEKLY_REPORT_PDF_OPTIONS,
    MONTHLY_REPORT_PDF_OPTIONS,
    FILE_EXTENSIONS,
    RECEIVING_ENTITY
}