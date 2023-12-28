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

module.exports = {
    DEFAULT_IN_OUT_TIME,
    WEEKLY_REPORT_PDF_OPTIONS
}