document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();
    checkCredentials();
});

function checkCredentials() {
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    fetch(`/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Invalid credentials');
        }
        return response.json();
    })
    .then(data => {
        localStorage.setItem('jwtToken', data.token);

        if (rememberMe) {
            saveCredentials(email, password);
        } else {
            removeCredentials();
        }

        window.location.href = "./pages/homepage.html";
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Invalid credentials! Please try again.');
    });
}

function handleKeyPress(event) {
    if (event.keyCode === 13) {
        checkCredentials();
    }
}

function saveCredentials(username, password) {
    localStorage.setItem("username", username);
    localStorage.setItem("password", password);
}

function removeCredentials() {
    localStorage.removeItem("username");
    localStorage.removeItem("password");
}

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