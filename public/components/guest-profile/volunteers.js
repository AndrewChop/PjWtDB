document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const userItems = document.getElementById('user-items');

    let users = [];

    const socket = new WebSocket('ws://192.168.158.164:3000');

    socket.onopen = function () {
        console.log('WebSocket connection established');
    };

    socket.onmessage = function (event) {
        console.log('Message received:', event.data); // Aggiungi questo log per debug
        if (event.data === "Welcome in the server WebSocket!") {
            console.log("Received welcome message, not a JSON, skipping parsing.");
            return;
        }
        try {
            const message = JSON.parse(event.data);
            if (message.type === 'UPDATE_USER') {
                console.log('Received update:', message.payload);
                const updatedUser = message.payload;
                const indexOfUserToUpdate = users.findIndex(user => user.id === updatedUser.id);
                if (indexOfUserToUpdate !== -1) {
                    users[indexOfUserToUpdate] = updatedUser;
                } else {
                    users.push(updatedUser);
                }
                renderUserList(users);
            }
        } catch (error) {
            console.error('Failed to parse message:', error);
        }
    };

    socket.onclose = function () {
        console.log('WebSocket connection closed');
    };

    async function loadVolunteersFromAPI() {
        try {
            const token = localStorage.getItem('jwtToken');
            const response = await fetch('/api/users/volunteers', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            users = await response.json();
            renderUserList(users);
        } catch (error) {
            console.error('Failed to load users from API:', error);
        }
    }

    // Funzione per renderizzare la lista degli utenti
    function renderUserList(userList) {
        if (userList.length === 0) {
            userItems.innerHTML = "<p>No users found.</p>";
        } else {
            userItems.innerHTML = '';
            userList.forEach(user => {
                const userItem = document.createElement('li');
                userItem.innerHTML = `
                    <span>${user.name} ${user.surname}</span>
                    <span>${user.email}</span>
                    <span>${user.cardNumber}</span>
                    <button class="view-button" data-user-id="${user.id}">View</button>
                `;
                userItems.appendChild(userItem);
            });
        }
    }

    // Gestore di eventi per il click sul pulsante "View"
    function handleUserItemClick(event) {
        if (event.target.classList.contains('view-button')) {
            const userId = event.target.getAttribute('data-user-id');
            const userToView = users.find(user => user.id === parseInt(userId));
            if (userToView) {
                populateViewForm(userToView);
            }
        }
    }

    // Aggiungi un gestore di eventi alla lista degli utenti per gestire il click sugli elementi utente
    userItems.addEventListener('click', handleUserItemClick);

    // Funzione per popolare il form di visualizzazione con i dettagli dell'utente selezionato
    function populateViewForm(user) {
        const viewCardNumber = document.getElementById('view-card-number');
        const viewEmail = document.getElementById('view-email');
        const viewName = document.getElementById('view-name');
        const viewSurname = document.getElementById('view-surname');
        const viewGender = document.getElementById('view-gender');
        const viewBirthDate = document.getElementById('view-birth-date');
        const viewNationality = document.getElementById('view-nationality');
        const viewPhone = document.getElementById('view-phone');
        const viewStudyField = document.getElementById('view-study-field');
        const viewOriginUniversity = document.getElementById('view-origin-university');
        const viewStudentNumber = document.getElementById('view-student-number');
        const viewAddressOrigin = document.getElementById('view-address-origin');
        const viewCityOrigin = document.getElementById('view-city-origin');
        const viewCountryOrigin = document.getElementById('view-country-origin');
        const viewDocumentType = document.getElementById('view-document-type');
        const viewNumberDoc = document.getElementById('view-number-doc');
        const viewExpirationDate = document.getElementById('view-expiration-date');
        const viewIssuedBy = document.getElementById('view-issued-by');

        viewCardNumber.value = user.cardNumber;
        viewEmail.value = user.email;
        viewName.value = user.name;
        viewSurname.value = user.surname;
        viewGender.value = user.gender;
        viewBirthDate.value = formatDateForInput(user.birthDate);
        viewNationality.value = user.nationality;
        viewPhone.value = user.phoneNumber;
        viewStudyField.value = user.studyField;
        viewOriginUniversity.value = user.originUniversity;
        viewStudentNumber.value = user.studentNumber;
        viewAddressOrigin.value = user.addressCityOfOrigin;
        viewCityOrigin.value = user.cityOfOrigin;
        viewCountryOrigin.value = user.countryOfOrigin;
        viewDocumentType.value = user.documentType;
        viewNumberDoc.value = user.documentNumber;
        viewExpirationDate.value = formatDateForInput(user.documentExpiration);
        viewIssuedBy.value = user.documentIssuer;

        const userViewForm = document.getElementById('user-view-form');
        userViewForm.classList.remove('hidden');
    }

    function formatDateForInput(dateString) {
        if (!dateString) return ''; // Gestione di date non valide o nulle
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Funzione per nascondere il form di visualizzazione utente
    function hideViewForm() {
        const userViewForm = document.getElementById('user-view-form');
        if (userViewForm) {
            userViewForm.classList.add('hidden');
        }
    }

    const closeViewButton = document.getElementById('close-view-button');
    if (closeViewButton) {
        closeViewButton.addEventListener('click', hideViewForm);
    }

    // Funzione per filtrare la lista degli utenti in base alla ricerca
    function filterUsers(query) {
        const normalizedQuery = query.toLowerCase().trim();

        const filteredUsers = users.filter(user => {
            const userData = `${user.name} ${user.surname} ${user.email} ${user.cardNumber}`.toLowerCase();
            return userData.includes(normalizedQuery);
        });

        renderUserList(filteredUsers);
    }

    // Gestione dell'evento di ricerca
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        filterUsers(query);
    });

    searchInput.addEventListener('keyup', event => {
        if (event.key === 'Enter') {
            const query = searchInput.value.trim();
            filterUsers(query);
        }
    });

    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Failed to parse JWT:', error);
            return null;
        }
    }

    loadVolunteersFromAPI();
});
