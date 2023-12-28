const axios = require('axios');

const apiInstance = axios.create({
    baseURL: 'https://api.etimeoffice.com/api',
    timeout: 10000,
    auth: {
        username: process.env.AUTH_USER_NAME,
        password: process.env.AUTH_USER_PASSWORD,
    },
});

module.exports = apiInstance;