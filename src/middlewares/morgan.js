const morgan = require("morgan");
const logger = require("../config/logger");

const stream = {
    // Use the http severity for HTTP logging
    write: (message) => logger.http(message),
};

const morganMiddleware = morgan(
    "combined",
    { stream }
);

module.exports = morganMiddleware;