const config = {
    serverHost: process.env.SERVER_HOST || '0.0.0.0',
    serverPort: process.env.PORT || 3000,
};

config.serverUrl = `/api`;

config.webSocketUrl = `ws`;

module.exports = config;