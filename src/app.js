const express = require('express');
const fs = require('fs');
const path = require('path');

class HRReportingApp {
    constructor() {
        this.app = express();

        // Use environment variables
        require('dotenv').config();

        // Global middleware
        // this.app.use(this.globalMiddleware.bind(this));

        this.setupRoutes();
    }

    // Global middleware
    globalMiddleware(req, res, next) {
        console.log('Executing global middleware');
        next();
    }

    setupRoutes() {
        const routesPath = path.join(__dirname, 'routes');

        fs.readdirSync(routesPath).forEach((file) => {
            const routes = require(path.join(routesPath, file));

            // Assuming each routes file exports an array of routes
            routes.forEach((route) => {
                const { path, middleware, handleGetRequest, handlePostRequest } = route;

                // Apply route-specific middleware
                if (typeof middleware === 'function') {
                    this.app.use(path, middleware);
                }

                if (typeof handleGetRequest === 'function') {
                    this.app.get(path, handleGetRequest);
                }

                if (typeof handlePostRequest === 'function') {
                    this.app.post(path, handlePostRequest);
                }
            });
        });
    }

    start() {
        const port = process.env.PORT || 8080;
        this.app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    }
}

const app = new HRReportingApp();
app.start();