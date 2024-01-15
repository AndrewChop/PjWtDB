function checkCredentials() {
    var email = document.querySelector(".email").value;
    var password = document.querySelector(".password").value;

    fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Credenziali non valide');
        }
        return response.json();
    })
    .then(data => {
        localStorage.setItem('jwtToken', data.token); // Salvataggio del token nel localStorage
        window.location.href = "./pages/homepage.html";
    })
    .catch(error => {
        console.error('Errore:', error);
        alert("Invalid credentials. Please try again.");
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
    const loginBoxes = document.querySelectorAll(".login-box");

    loginBoxes.forEach((loginBox) => {
        const savedUsername = localStorage.getItem("username");
        const savedPassword = localStorage.getItem("password");

        if (savedUsername && savedPassword) {
            loginBox.querySelector(".username").value = savedUsername;
            loginBox.querySelector(".password").value = savedPassword;
            loginBox.querySelector(".remember-checkbox").checked = true;
        }
    });
});

document.querySelector(".remember-checkbox").addEventListener("change", function () {
    if (!this.checked) {
        removeCredentials();
    }
});
