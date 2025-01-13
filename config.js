const config = {
    //serverHost: '192.168.1.3',
    serverHost: '0.0.0.0',
    serverPort: 3000,
};

// URL per le chiamate HTTP/REST
config.serverUrl = `http://${config.serverHost}:${config.serverPort}`;

// URL per la connessione WebSocket
config.webSocketUrl = `ws://${config.serverHost}:${config.serverPort}`;

module.exports = config;