fetch('http://localhost:3000/api/test-credentials')
.then(response => response.json())
.then(data => {
    console.log('Credenziali utenti:', data);
})
.catch(error => console.error('Errore:', error));
