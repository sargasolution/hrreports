module.exports = {
    apps: [
        {
            name: 'hr-punch-report',
            script: './src/app.js',
            autorestart: true,
            watch: process.env.NODE_ENV === 'development',
            env: {
                NODE_ENV: 'development',
            },
            env_production: {
                NODE_ENV: 'production',
                WATCH: false
            },
        },
    ],
};
