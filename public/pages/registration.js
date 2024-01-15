document.getElementById('registration-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('psw').value;
    const passwordRepeat = document.getElementById('psw-repeat').value;

    // Validazione della password e dell'email
    if (password !== passwordRepeat) {
        alert("Le password non coincidono.");
        return;
    }

    if (!validateEmail(email)) {
        alert("Formato email non valido.");
        return;
    }

    // Feedback di caricamento all'utente
    const submitButton = document.querySelector('.signupbtn');
    submitButton.textContent = 'Registrazione in corso...';
    submitButton.disabled = true;

    // Invio dei dati al server
    fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Errore nella registrazione');
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        localStorage.setItem('jwtToken', data.token);
        window.location.href = 'complete-profile.html';
    })
    .catch(error => {
        console.error('Si è verificato un errore completo:', error);
        alert('Si è verificato un errore: ' + error.message);
        submitButton.textContent = 'Sign Up';
        submitButton.disabled = false;
    });    
});

function validateEmail(email) {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/;
    return re.test(String(email).toLowerCase());
}
