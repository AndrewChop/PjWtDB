function handleCancelButtonClick() {
    window.location.href = '../index.html';
}

document.getElementById('cancel-button').addEventListener('click', handleCancelButtonClick);

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('registration-form').addEventListener('submit', handleRegistrationFormSubmit);
});

async function handleRegistrationFormSubmit(event) {
    event.preventDefault();

    const email = document.getElementById('email').value.toLowerCase();
    const password = document.getElementById('psw').value;
    const passwordRepeat = document.getElementById('psw-repeat').value;
    //const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!validateEmail(email)) {
        alert("Email format not valid.");
        return;
    }

    if (!email.endsWith('@esnpisa.it')) {
        alert('You must use an @esnpisa.it email address.');
        return;
    }

    if (password !== passwordRepeat) {
        alert("The passwords do not match.");
        return;
    }

    /*if (!passwordRegex.test(password)) {
        alert('La password deve contenere almeno 8 caratteri, un carattere maiuscolo e un numero.');
        return;
    } */

    const submitButton = document.querySelector('.signupbtn');
    submitButton.textContent = 'Sending verification email...';
    submitButton.disabled = true;

    try {
        // Invio della richiesta per la verifica email
        const response = await fetch('/api/auth/send-verification-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        if (response.status === 409) {
            console.log("Email già in uso");
            throw new Error('Email already registered. Please log in or use another email.');
        }

        if (!response.ok) {
            const errorMessage = await response.text();
            console.log("Qui è presente un errore:" + errorMessage);
            throw new Error(errorMessage || 'Failed to send verification email.');
        }

        alert('Verification email sent. Please check your inbox!');
        console.log("Mail inviata con successo");
        submitButton.textContent = 'Sign Up';
        submitButton.disabled = false;
    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
        submitButton.textContent = 'Sign Up';
        submitButton.disabled = false;
    }
}

function validateEmail(email) {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/;
    return re.test(String(email).toLowerCase());
}










/* function handleCancelButtonClick() {
    window.location.href = '../index.html';
}
  
document.getElementById('cancel-button').addEventListener('click', handleCancelButtonClick);

//const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;


document.getElementById('registration-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    let email = document.getElementById('email').value;
    const password = document.getElementById('psw').value;
    const passwordRepeat = document.getElementById('psw-repeat').value;

    email = email.toLowerCase();
    document.getElementById('email').value = email;

    /*if (!passwordRegex.test(password)) {
        alert('La password deve contenere almeno 8 caratteri, un carattere maiuscolo e un numero.');
        return;
    }  //         /*

    // Validazione della password e dell'email
    if (password !== passwordRepeat) {
        alert("The passwords are differents.");
        return;
    }

    if (!validateEmail(email)) {
        alert("Email format not valid.");
        return;
    }

    // Feedback di caricamento all'utente
    const submitButton = document.querySelector('.signupbtn');
    submitButton.textContent = 'Registration in progress...';
    submitButton.disabled = true;

// Invio dei dati al server
    fetch(`/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(response => {
        console.log('Response:', response);
        if (!response.ok) {
            if (response.status === 409) {
                throw new Error('Email already in use! Please try another email address.');
            } else {
                throw new Error('Error in the registration!');
            }
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        const token = data.token;
        console.log("Token received (REGISTRATION):", data.token);
        localStorage.setItem('jwtToken', token);
        console.log('Token salvato in localStorage:', localStorage.getItem('jwtToken'));
        window.location.href = 'complete-profile.html';
    })
    .catch(error => {
        console.error('A complete error has occurred:', error);
        alert('An error has occurred: ' + error.message);
        submitButton.textContent = 'Sign Up';
        submitButton.disabled = false;
    });  
});

function validateEmail(email) {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/;
    return re.test(String(email).toLowerCase());
}
 */