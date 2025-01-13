const config = {
    serverHost: process.env.SERVER_HOST || '0.0.0.0',
    serverPort: process.env.PORT || 3000,
};

// URL per le chiamate HTTP/REST
config.serverUrl = `/api`;

// URL per la connessione WebSocket
config.webSocketUrl = `ws`;

module.exports = config;