fetch('/config').then(response => response.json()).then(config => {


fetch(`http://${config.SERVER_HOST}:${config.SERVER_PORT}/api/test-credentials`)
.then(response => response.json())
.then(data => {
    console.log('Credenziali utenti:', data);
})
.catch(error => console.error('Errore:', error));

});