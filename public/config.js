window.config = {
    serverHost: '192.168.1.3',
    serverPort: 3000,
};

// URL per le chiamate HTTP/REST
window.config.serverUrl = `http://${window.config.serverHost}:${window.config.serverPort}`;

// URL per la connessione WebSocket
window.config.webSocketUrl = `ws://${window.config.serverHost}:${window.config.serverPort}`;