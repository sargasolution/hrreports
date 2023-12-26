const axios = require('axios');

const apiInstance = axios.create({
    baseURL: 'https://api.etimeoffice.com/api',
    timeout: 10000,
    headers: {
        'Authorization': `Basic ${process.env.AUTH_TOKEN}`
    },
});

module.exports = apiInstance;