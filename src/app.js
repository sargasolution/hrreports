const express = require('express');
const fs = require('fs');
const path = require('path');

class HRReportingApp {
    constructor() {
        this.app = express();

        // Use environment variables
        require('dotenv').config();

        // Serve static files (including fonts) from the "fonts" folder
        this.app.use(express.static(path.join(__dirname, 'public')));

        // Middleware for parsing JSON in request body
        this.app.use(express.json());

        // Configure EJS as the view engine
        this.app.set('view engine', 'ejs');
        this.app.set('views', path.join(__dirname, 'views'));

        // Global middleware
        // this.app.use(this.globalMiddleware.bind(this));

        this.setupRoutes();
        this.setupCronJobs();
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

                // Apply any GET request handlers for the routes
                if (typeof handleGetRequest === 'function') {
                    this.app.get(path, handleGetRequest);
                }

                // Apply any POST request handlers for the routes
                if (typeof handlePostRequest === 'function') {
                    this.app.post(path, handlePostRequest);
                }
            });
        });
    }

    setupCronJobs() {
        const cronPath = path.join(__dirname, 'crons');

        fs.readdirSync(cronPath).forEach((file) => {
            const cronJob = require(path.join(cronPath, file));

            // Assuming each cron job file exports a run() method
            if (typeof cronJob.run === 'function') {
                cronJob.run();
            }
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
app.start(); ``