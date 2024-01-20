fetch('/api/test-credentials')
.then(response => response.json())
.then(data => {
    console.log('Credenziali utenti:', data);
})
.catch(error => console.error('Errore:', error));
