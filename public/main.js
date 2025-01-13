document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();
    checkCredentials();
});

function checkCredentials() {
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;

    fetch(`${window.config.serverUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(response => {
        if (!response.ok) {
            console.log('Attention!', response.status, response.statusText);
            throw new Error('Invalid credentials');
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        localStorage.setItem('jwtToken', data.token);
        console.log('Token saved:', data.token);
        window.location.href = "./pages/homepage.html";
    })
    .catch(error => {
        console.log('An error occurred here:', error);
        console.error('Error:', error);
        alert('Invalid credentials! Please try again.');
    });
}

// Aggiungi un ascoltatore per il tasto Invio
function handleKeyPress(event) {
    if (event.keyCode === 13) {
        checkCredentials();
    }
}

// Funzione per salvare le credenziali nel localStorage
function saveCredentials(username, password) {
    localStorage.setItem("username", username);
    localStorage.setItem("password", password);
}

// Funzione per rimuovere le credenziali salvate dal localStorage
function removeCredentials() {
    localStorage.removeItem("username");
    localStorage.removeItem("password");
}

// Al caricamento della pagina, popola automaticamente i campi di login con le credenziali salvate
window.addEventListener("load", function () {
    const savedUsername = localStorage.getItem("username");
    const savedPassword = localStorage.getItem("password");

    if (savedUsername && savedPassword) {
        document.getElementById('email').value = savedUsername;
        document.getElementById('password').value = savedPassword;
        document.getElementById('rememberMe').checked = true;
    }
});

document.querySelector(".remember-checkbox").addEventListener("change", function () {
    if (!this.checked) {
        removeCredentials();
    }
});
