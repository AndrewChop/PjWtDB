document.addEventListener('DOMContentLoaded', function () {
    loadUserData();
    updateUIForRole();
});

// Funzione per caricare i dati dell'utente dal server
async function fetchUserData() {
    const token = localStorage.getItem('jwtToken'); // Assumi che il token sia salvato qui

    try {
        const response = await fetch('/api/user/data', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        });

        if (!response.ok) {
            throw new Error(`Errore HTTP: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Errore nel recupero dei dati utente:', error);
        return null;
    }
}


async function loadUserData() {
    const userData = await fetchUserData();

    if (userData) {
        // Popola i campi del form con i dati ricevuti
        document.getElementById('user-card-number').value = userData.numberCard;
        document.getElementById('user-email').value = userData.email;
        document.getElementById('user-name').value = userData.name;
        document.getElementById('user-surname').value = userData.surname;
        document.getElementById('user-gender').value = userData.gender;
        document.getElementById('user-birthdate').value = userData.birthdate;
        document.getElementById('user-nationality').value = userData.nationality;
        document.getElementById('user-phone-number').value = userData.phoneNumber;
        document.getElementById('user-study-field').value = userData.studyField;
        document.getElementById('user-origin-university').value = userData.originUniversity;
        document.getElementById('user-host-university').value = userData.hostUniversity;
        document.getElementById('user-exchange-duration').value = userData.exchangeDuration;
        document.getElementById('user-student-number').value = userData.studentNumber;
        document.getElementById('user-address-origin').value = userData.addressOrigin;
        document.getElementById('user-city-origin').value = userData.cityOrigin;
        document.getElementById('user-country-origin').value = userData.countryOrigin;
        document.getElementById('user-address-host').value = userData.addressHost;
        document.getElementById('user-city-host').value = userData.cityHost;
        document.getElementById('user-number-doc').value = userData.numberDoc;
        document.getElementById('user-document-type').value = userData.documentType;
        document.getElementById('user-expiration').value = userData.expiration;
        document.getElementById('user-issued-by').value = userData.issuedBy;
    }
}

// Funzione per salvare i dati dell'utente sul server
async function saveUserData(userData) {
    try {
        const response = await fetch('/api/user/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Aggiungi qui eventuali header per l'autenticazione
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            throw new Error(`Errore HTTP: ${response.status}`);
        }

        const result = await response.json();
        alert(result.message); // Messaggio di successo dal server
    } catch (error) {
        console.error('Errore nel salvataggio dei dati utente:', error);
        alert('Errore nel salvataggio dei dati.');
    }
}

function saveChanges() {
    // Raccogli i dati del form
    const userData = {
        numberCard: document.getElementById('user-card-number').value,
        email: document.getElementById('user-email').value,
        name: document.getElementById('user-name').value,
        surname: document.getElementById('user-surname').value,
        gender: document.getElementById('user-gender').value,
        birthdate: document.getElementById('user-birthdate').value,
        nationality: document.getElementById('user-nationality').value,
        phoneNumber: document.getElementById('user-phone-number').value,
        studyField: document.getElementById('user-study-field').value,
        originUniversity: document.getElementById('user-origin-university').value,
        hostUniversity: document.getElementById('user-host-university').value,
        exchangeDuration: document.getElementById('user-exchange-duration').value,
        studentNumber: document.getElementById('user-student-number').value,
        addressOrigin: document.getElementById('user-address-origin').value,
        cityOrigin: document.getElementById('user-city-origin').value,
        countryOrigin: document.getElementById('user-country-origin').value,
        addressHost: document.getElementById('user-address-host').value,
        cityHost: document.getElementById('user-city-host').value,
        numberDoc: document.getElementById('user-number-doc').value,
        documentType: document.getElementById('user-document-type').value,
        expiration: document.getElementById('user-expiration').value,
        issuedBy: document.getElementById('user-issued-by').value
    };

    saveUserData(userData);
}

const saveChangesButton = document.getElementById('save-button');
saveChangesButton.addEventListener('click', saveChanges);

// Funzione per ottenere il ruolo dell'utente dal server
async function fetchUserRole() {
    try {
        const response = await fetch('/api/user/role', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Aggiungi qui eventuali header per l'autenticazione
            }
        });

        if (!response.ok) {
            throw new Error(`Errore HTTP: ${response.status}`);
        }

        const data = await response.json();
        return data.role;
    } catch (error) {
        console.error('Errore nel recupero del ruolo dell\'utente:', error);
        return null;
    }
}

async function updateUIForRole() {
    const userRole = await fetchUserRole();

    if (userRole) {
        document.getElementById('user-role-display').innerText = `Ruolo: ${userRole}`;

        if (userRole === 'ADMIN') {
            const adminPanel = document.createElement('div');
            adminPanel.innerText = 'Pannello di Amministrazione';
            adminPanel.className = 'admin-panel';
            adminPanel.innerHTML = `
                <h2>Pannello di Amministrazione</h2>
                <a href="/admin/gestione-utenti">Gestione Utenti</a>
                <a href="/admin/statistiche">Visualizza Statistiche</a>
                <!-- Altri link o contenuti -->
            `;
            document.body.appendChild(adminPanel);
        } else if (userRole === 'STUDENT') {
            const adminSpecificElements = document.querySelectorAll('.admin-only');
            adminSpecificElements.forEach(element => element.style.display = 'none');
        } else if (userRole === 'VOLUNTEER') {
            const volunteerTools = document.createElement('div');
            volunteerTools.innerText = 'Strumenti per Volontari';
            volunteerTools.className = 'volunteer-tools';
            volunteerTools.innerHTML = `
                <h2>Strumenti per Volontari</h2>
                <a href="/volontari/risorse">Risorse Utili</a>
                <a href="/volontari/eventi">Calendario Eventi</a>
                <!-- Altri link o contenuti -->
            `;
            document.body.appendChild(volunteerTools);
        }
    } else {
        document.getElementById('user-role-display').innerText = 'Ruolo: Non identificato';
        // Gestisci il caso in cui il ruolo non è disponibile
    }
}

// Funzione per effettuare il logout
async function logout() {
    try {
        const response = await fetch('/api/user/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Aggiungi qui eventuali header per l'autenticazione
            }
        });

        if (!response.ok) {
            throw new Error(`Errore HTTP: ${response.status}`);
        }

        const result = await response.json();
        alert(result.message); // Messaggio di successo dal server
        window.location.href = '/'; // Reindirizza alla home
    } catch (error) {
        console.error('Errore nel logout:', error);
        alert('Errore nel logout.');
    }
}

const logoutButton = document.getElementById('logout-button');
logoutButton.addEventListener('click', logout);


