 // Funzione per mostrare il form di inserimento utente
 function showUserForm() {
    const userForm = document.getElementById('profile-form');
    userForm.classList.remove('hidden');
}

document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const userItems = document.getElementById('user-items');
    const addUserButton = document.getElementById('add-user-button');
    
    // Lista degli utenti 
    let users = []; 
    
    // Connessione al WebSocket server
    const socket = new WebSocket('ws://192.168.1.38:3000');

    socket.onopen = function () {
        console.log('WebSocket connection established');
    };

    socket.onmessage = function (event) {
        const message = JSON.parse(event.data);
        if (message.type === 'UPDATE_USER') {
            console.log('Received update:', message.payload);
            // Aggiornare l'elenco degli utenti e renderizzarlo nuovamente
            const updatedUser = message.payload;
            const indexOfUserToUpdate = users.findIndex(user => user.id === updatedUser.id);
            if (indexOfUserToUpdate !== -1) {
                users[indexOfUserToUpdate] = updatedUser;
            } else {
                users.push(updatedUser);
            }
            renderUserList(users);
        }
    };

    socket.onclose = function () {
        console.log('WebSocket connection closed');
    };

    async function loadVolunteersFromAPI() {
        try {
            const token = localStorage.getItem('jwt');
            const response = await fetch('/api/users/volunteers', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const users = await response.json();
            renderUserList(users);
        } catch (error) {
            console.error('Failed to load users from API:', error);
        }
    }

    async function loadVolunteersFromAPI() {
        try {
            const token = localStorage.getItem('jwt');
            const response = await fetch('/api/users/volunteers', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const users = await response.json();
            renderUserList(users);
        } catch (error) {
            console.error('Failed to load users from API:', error);
        }
    }

    // Funzione per aggiungere un volontario alla lista visualizzata
    function addVolunteerToList(volunteer) {
        const volunteerList = document.getElementById('volunteerList');
        const listItem = document.createElement('li');
        listItem.textContent = `${volunteer.name} ${volunteer.surname}`;
        volunteerList.appendChild(listItem);
    }

    // Rimuove un volontario usando l'API
    function removeUser(userId) {
        fetch(`/api/users/${userId}`, {
            method: 'DELETE'
        }).then(() => {
            console.log('User removed');
            loadVolunteersFromAPI(); // Ricarica la lista dopo la rimozione
        }).catch(error => console.error('Error removing user:', error));
    }

    // Aggiorna un volontario usando l'API
    function updateUser(userId, userData) {
        fetch(`/api/users/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        }).then(() => {
            console.log('User updated');
            loadVolunteersFromAPI(); // Ricarica la lista dopo l'aggiornamento
        }).catch(error => console.error('Error updating user:', error));
    }

    // Funzione per filtrare la lista degli utenti in base alla ricerca
    function filterUsers(query) {
        console.log('filterUsers IN', query, users);
        const filteredUsers = users.filter(user => {
            const fullName = `${user.name} ${user.surname}`;
            return fullName.toLowerCase().includes(query.toLowerCase()) || user.cardNumber.includes(query);
        });
        console.log('filterUsers OUT', filteredUsers);
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

    // Funzione per nascondere il form di inserimento utente
    function hideUserForm() {
        const userForm = document.getElementById('profile-form');
        userForm.classList.add('hidden');
    }
    // Funzione per nascondere il form di modifica utente
    function hideEditForm() {
        const userEditForm = document.getElementById('user-edit-form');
        userEditForm.classList.add('hidden');
    }

    // Aggiungi un gestore di eventi per il click sul pulsante "Cancel" nel form di inserimento utente
    const cancelButton = document.getElementById('cancel-user');
    cancelButton.addEventListener('click', () => {
        hideUserForm();
    });

    // Aggiungi un gestore di eventi per il click sul pulsante "Cancel" nel form di modifica utente
    const cancelEditButton = document.getElementById('cancel-edit-button');
    cancelEditButton.addEventListener('click', () => {
        hideEditForm();
    });

    // Gestione dell'evento di aggiunta utente
    addUserButton.addEventListener('click', () => {
        showUserForm(); 
    });

    // Pulsante per confermare l'aggiunta dell'utente
    const confirmAddUserButton = document.getElementById('confirm-user');
    confirmAddUserButton.addEventListener('click', () => {
        const userCardNumber = document.getElementById('user-card-number').value.trim();        
        const userEmail = document.getElementById('user-email').value.trim();
        const userName = document.getElementById('user-name').value.trim();
        const userSurname = document.getElementById('user-surname').value.trim();
        const userGender = document.getElementById('user-gender').value.trim();
        const userBirthDate = document.getElementById('user-birth-date').value.trim();
        const userNationality = document.getElementById('user-nationality').value.trim();
        const userPhone = document.getElementById('user-phone').value.trim();
        const userStudyField = document.getElementById('user-study-field').value.trim();
        const userOriginUniversity = document.getElementById('user-origin-university').value.trim();
        const userStudentNumber = document.getElementById('user-student-number').value.trim();
        const userAddressOrigin = document.getElementById('user-address-origin').value.trim();
        const userCityOrigin = document.getElementById('user-city-origin').value.trim();
        const userCountryOrigin = document.getElementById('user-country-origin').value.trim();
        const userDocumentType = document.getElementById('user-document-type').value.trim();
        const userNumberDoc = document.getElementById('user-number-doc').value.trim();
        const userExpirationDate = document.getElementById('user-expiration-date').value.trim();
        const userIssuedBy = document.getElementById('user-issued-by').value.trim();

        if (userCardNumber && userEmail && userName && userSurname && userGender && userBirthDate && userNationality && userPhone && userStudyField && userOriginUniversity && userStudentNumber && userAddressOrigin && userCityOrigin && userCountryOrigin && userDocumentType && userNumberDoc && userExpirationDate && userIssuedBy) {
            const newUser = {
                cardNumber: userCardNumber,
                email: userEmail,
                name: userName,
                surname: userSurname,
                gender: userGender,
                birthDate: userBirthDate,
                nationality: userNationality,
                phone: userPhone,
                studyField: userStudyField,
                originUniversity: userOriginUniversity,
                studentNumber: userStudentNumber,
                addressOrigin: userAddressOrigin,
                cityOrigin: userCityOrigin,
                countryOrigin: userCountryOrigin,
                documentType: userDocumentType,
                numberDoc: userNumberDoc,
                expirationDate: userExpirationDate,
                issuedBy: userIssuedBy
            };

            addNewUser(newUser);
            
            hideUserForm();

        } else {
            alert('Please enter all user fields!');
        }
    });

    // Funzione per aggiungere un nuovo utente alla lista
    function addNewUser(user) {
        users.push(user);
        renderUserList(users);
        saveUserListToLocalStorage(users);
        hideUserForm();

        // Pulisci i campi del form
        document.getElementById('user-card-number').value = '';
        document.getElementById('user-email').value = '';
        document.getElementById('user-name').value = '';
        document.getElementById('user-surname').value = '';
        document.getElementById('user-gender').value = '';
        document.getElementById('user-birth-date').value = '';
        document.getElementById('user-nationality').value = '';
        document.getElementById('user-phone').value = '';
        document.getElementById('user-study-field').value = '';
        document.getElementById('user-origin-university').value = '';
        document.getElementById('user-student-number').value = '';
        document.getElementById('user-address-origin').value = '';
        document.getElementById('user-city-origin').value = '';
        document.getElementById('user-country-origin').value = '';
        document.getElementById('user-document-type').value = '';
        document.getElementById('user-number-doc').value = '';
        document.getElementById('user-expiration-date').value = '';
        document.getElementById('user-issued-by').value = '';
}
    
    function saveUserListToLocalStorage(userList) {
        localStorage.setItem('userList', JSON.stringify(userList));
    }

    // Funzione per renderizzare la lista degli utenti
    function renderUserList(userList) {
        const userItems = document.getElementById('user-items');
        if (users.length === 0) {
            userItems.innerHTML = "<p>No users found.</p>";
        } else {
            userItems.innerHTML = '';
            userList.forEach(user => {
                const userItem = document.createElement('li');
                userItem.innerHTML = `
                    <span>${user.name} ${user.surname}</span>
                    <span>${user.email}</span>
                    <span>${user.cardNumber}</span>
                    <button class="edit-button" data-cardNumber="${user.cardNumber}">Edit</button>
                    <button class="remove-button" data-cardNumber="${user.cardNumber}">Remove</button>
                `;
                userItems.appendChild(userItem);
            });
        }
    }

    // Inizializza la lista degli utenti
    loadVolunteersFromAPI();
    
    // Inizializza la lista degli utenti
    users = JSON.parse(localStorage.getItem('userList')) || [];
    renderUserList(users);

    // Gestore di eventi per il click sul pulsante "Edit"
    function handleUserItemClick(event) {
        if (event.target.classList.contains('edit-button')) {
            const cardNumber = event.target.getAttribute('data-cardNumber');

            const userToEdit = users.find(user => user.cardNumber === cardNumber);
            
            if (userToEdit) {
                populateEditForm(userToEdit, cardNumber);
                const userIndex = users.findIndex(u => u.cardNumber === userToEdit.cardNumber);
                if (userIndex!== -1) {
                    users[userIndex] = userToEdit;
                }
            }
        }
    }

    // Aggiungi un gestore di eventi alla lista degli utenti per gestire il click sugli elementi utente
    userItems.addEventListener('click', handleUserItemClick);

    // Funzione per popolare il form di modifica con i dettagli dell'utente selezionato
    function populateEditForm(user, cardNumber) {
        const editCardNumber = document.getElementById('edit-card-number');
        const editEmail = document.getElementById('edit-email');
        const editName = document.getElementById('edit-name');
        const editSurname = document.getElementById('edit-surname');
        const editGender = document.getElementById('edit-gender');
        const editBirthDate = document.getElementById('edit-birth-date');
        const editNationality = document.getElementById('edit-nationality');
        const editPhone = document.getElementById('edit-phone');
        const editStudyField = document.getElementById('edit-study-field');
        const editOriginUniversity = document.getElementById('edit-origin-university');
        const editStudentNumber = document.getElementById('edit-student-number');
        const editAddressOrigin = document.getElementById('edit-address-origin');
        const editCityOrigin = document.getElementById('edit-city-origin');
        const editCountryOrigin = document.getElementById('edit-country-origin');
        const editDocumentType = document.getElementById('edit-document-type');
        const editNumberDoc = document.getElementById('edit-number-doc');
        const editExpirationDate = document.getElementById('edit-expiration-date');
        const editIssuedBy = document.getElementById('edit-issued-by');
    
        editCardNumber.value = user.cardNumber;
        editEmail.value = user.email;
        editName.value = user.name;
        editSurname.value = user.surname;
        editGender.value = user.gender;
        editBirthDate.value = user.birthDate;
        editNationality.value = user.nationality;
        editPhone.value = user.phone;
        editStudyField.value = user.studyField;
        editOriginUniversity.value = user.originUniversity;
        editStudentNumber.value = user.studentNumber;
        editAddressOrigin.value = user.addressOrigin;
        editCityOrigin.value = user.cityOrigin;
        editCountryOrigin.value = user.countryOrigin;
        editDocumentType.value = user.documentType;
        editNumberDoc.value = user.numberDoc;
        editExpirationDate.value = user.expirationDate;
        editIssuedBy.value = user.issuedBy;
            
        const userEditForm = document.getElementById('user-edit-form');
        userEditForm.classList.remove('hidden');
    }

    // Aggiungi un gestore di eventi per il pulsante "Salva Modifiche" nel form di modifica
    const saveEditButton = document.getElementById('save-edit-button');
    saveEditButton.addEventListener('click', () => {
        // Ottieni i dettagli modificati dall'utente nel form di modifica
        const editedCardNumber = document.getElementById('edit-card-number').value.trim();
        const editedEmail = document.getElementById('edit-email').value.trim();
        const editedName = document.getElementById('edit-name').value.trim();
        const editedSurname = document.getElementById('edit-surname').value.trim();
        const editedGender = document.getElementById('edit-gender').value.trim();
        const editedBirthDate = document.getElementById('edit-birth-date').value.trim();
        const editedNationality = document.getElementById('edit-nationality').value.trim();
        const editedPhone = document.getElementById('edit-phone').value.trim();
        const editedStudyField = document.getElementById('edit-study-field').value.trim();
        const editedOriginUniversity = document.getElementById('edit-origin-university').value.trim();
        const editedStudentNumber = document.getElementById('edit-student-number').value.trim();
        const editedAddressOrigin = document.getElementById('edit-address-origin').value.trim();
        const editedCityOrigin = document.getElementById('edit-city-origin').value.trim();
        const editedCountryOrigin = document.getElementById('edit-country-origin').value.trim();
        const editedDocumentType = document.getElementById('edit-document-type').value.trim();
        const editedNumberDoc = document.getElementById('edit-number-doc').value.trim();
        const editedExpirationDate = document.getElementById('edit-expiration-date').value.trim();
        const editedIssuedBy = document.getElementById('edit-issued-by').value.trim();

        // Crea un oggetto utente con i dettagli modificati
        const editedUser = {
            cardNumber: editedCardNumber,
            email: editedEmail,
            name: editedName,
            surname: editedSurname,
            gender: editedGender,
            birthDate: editedBirthDate,
            nationality: editedNationality,
            phone: editedPhone,
            studyField: editedStudyField,
            originUniversity: editedOriginUniversity,
            studentNumber: editedStudentNumber,
            addressOrigin: editedAddressOrigin,
            cityOrigin: editedCityOrigin,
            countryOrigin: editedCountryOrigin,
            documentType: editedDocumentType,
            numberDoc: editedNumberDoc,
            expirationDate: editedExpirationDate,
            issuedBy: editedIssuedBy,
        };

        // Sovrascrivi l'utente modificato nell'array "users"
        const indexOfUserToEdit = users.findIndex(x => x.cardNumber === editedUser.cardNumber);
        if(indexOfUserToEdit !== -1) users[indexOfUserToEdit] = editedUser;

        // Chiudi il form di modifica
        const userEditForm = document.getElementById('user-edit-form');
        userEditForm.classList.add('hidden');

        // Aggiorna la lista degli utenti con le modifiche
        renderUserList(users);

        // Salva l'array aggiornato nella localStorage
        saveUserListToLocalStorage(users);
    });

    // Gestore di eventi per il click sul pulsante "Remove"
    function handleRemoveButtonClick(event) {
        if (event.target.classList.contains('remove-button')) {
            const cardNumber = event.target.getAttribute('data-cardNumber');

            // Trova l'indice dello studente da rimuovere nell'array "students"
            const indexOfUserToRemove = users.findIndex(user => user.cardNumber === cardNumber);

            if (indexOfUserToRemove !== -1) {
                // Rimuovi lo studente dall'array
                users.splice(indexOfUserToRemove, 1);
                // Salva l'array aggiornato nella localStorage
                saveUserListToLocalStorage(users);
            } else {
                console.error("User not found in the array."); 
            }
            // Aggiorna la lista degli studenti
            renderUserList(users);
        }
    }

    // Aggiungi un gestore di eventi alla lista degli studenti per gestire il click sul pulsante "Remove"
    userItems.addEventListener('click', handleRemoveButtonClick);
    
    // Trova il pulsante "Remove All" nell'HTML
    const removeAllButton = document.getElementById('remove-all-button');

    // Aggiungi un gestore di eventi per il clic sul pulsante
    removeAllButton.addEventListener('click', () => {
        users = [];        
        renderUserList(users);        
        saveUserListToLocalStorage(users);
    });
    
});


// Gestisce il bottone +
document.addEventListener('DOMContentLoaded', function() {
    const addButton = document.querySelector('.add-button');
    const menuItems = document.querySelector('.menu-items');

    if (addButton && menuItems) {
        addButton.addEventListener('click', function(event) {
            menuItems.style.display = (menuItems.style.display === 'block') ? 'none' : 'block';
            event.stopPropagation();
        });

        document.addEventListener('click', function() {
            menuItems.style.display = 'none';
        });

        menuItems.addEventListener('click', function(event) {
            event.stopPropagation();
        });

        const addUserButton = document.getElementById('add-user-button');

        if (addUserButton) {
            addUserButton.addEventListener('click', function(event) {
                event.stopPropagation();
                showUserForm();
            });
        }
    }
});
