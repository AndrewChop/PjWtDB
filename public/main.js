function checkCredentials() {
    var username = document.querySelector(".username").value;
    var password = document.querySelector(".password").value;

    // Esempio di credenziali valide
    var validUsername = "utente";
    var validPassword = "1234";

    if (username === validUsername && password === validPassword) {
        var banner = document.querySelector(".banner");
        banner.style.display = "block";

        setTimeout(function() {
            banner.style.display = "none";
        }, 7000);

        // Salva le credenziali se l'utente ha spuntato "Ricordami"
        if(document.querySelector(".remember-checkbox").checked) {
            saveCredentials(username, password);
        } else {
            removeCredentials();
        }
        window.location.href = "./pages/homepage.html";
    } else {
        alert("Invalid credentials. Please try again.");
    }
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
    window.addEventListener("load", function() {
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

    document.querySelector(".remember-checkbox").addEventListener("change", function() {
        if (!this.checked) {
            removeCredentials();
        }
    });
