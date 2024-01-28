const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.simple()
    ),
    transports: [
        new winston.transports.Console({
            level: 'debug', // Console log level
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
        }),
        new DailyRotateFile({
            level: 'debug', // File log level
            filename: 'src/logs/application-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '30d',
        }),
    ],
    exitOnError: false
});

// Create custom log levels
const customLevels = {
    log: 0,
    error: 1,
    info: 2,
    debug: 3,
    warn: 4,
    http: 5,
};

// Add custom log levels
const colors = {
    log: 'blue',
    error: 'red',
    info: 'green',
    debug: 'yellow',
    warn: 'orange',
    http: 'magenta',
};



winston.addColors(colors);

// Use custom log levels
logger.setLevels(customLevels);

module.exports = logger;