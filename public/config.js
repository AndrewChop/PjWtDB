window.config = {
    serverUrl: 'https://swen-esn-management-web-platform.onrender.com',
    webSocketUrl: 'wss://swen-esn-management-web-platform.onrender.com',
};

// URL per le chiamate HTTP/REST
window.config.serverUrl = `http://${window.config.serverHost}:${window.config.serverPort}`;

// URL per la connessione WebSocket
window.config.webSocketUrl = `ws://${window.config.serverHost}:${window.config.serverPort}`;