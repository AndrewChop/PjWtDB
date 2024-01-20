document.addEventListener('DOMContentLoaded', function() {
    loadPendingUsers();
});

function loadPendingUsers() {
    fetch('/api/users/pending', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` }
    })
    .then(response => response.json())
    .then(users => {
        // Qui puoi popolare la lista degli utenti nella pagina
        displayPendingUsers(users);
    })
    .catch(error => console.error('Errore:', error));
}

function displayPendingUsers(users) {
    const userList = document.getElementById('user-items');
    users.forEach(user => {
        const userItem = document.createElement('li');
        userItem.innerHTML = `
            <span>${user.name} ${user.surname}</span>
            <span>${user.cardNumber}</span>
            <span>${user.role}</span>
            <button class="edit-button" onclick="editUser('${user.cardNumber}')">Edit</button>
            <button class="accept-button" onclick="acceptUser('${user.cardNumber}')">Accept</button>
            <button class="reject-button" onclick="rejectUser('${user.cardNumber}')">Reject</button>
        `;
        userList.appendChild(userItem);
    });
}

function editUser(cardNumber) {
    // Trova l'utente corrispondente al numero di carta fornito
    const userToEdit = users.find(user => user.cardNumber === cardNumber);

    // Popola il modulo con i dati dell'utente
    document.getElementById('edit-card-number').value = userToEdit.cardNumber;
    document.getElementById('edit-email').value = userToEdit.email;
    document.getElementById('edit-role').value = userToEdit.role;
    document.getElementById('edit-name').value = userToEdit.name;
    document.getElementById('edit-surname').value = userToEdit.surname;
    document.getElementById('edit-gender').value = userToEdit.gender;
    document.getElementById('edit-birthdate').value = userToEdit.birthDate;
    document.getElementById('edit-nationality').value = userToEdit.nationality;
    document.getElementById('edit-phone-number').value = userToEdit.phoneNumber;
    document.getElementById('edit-study-field').value = userToEdit.studyField;
    document.getElementById('edit-origin-university').value = userToEdit.originUniversity;
    document.getElementById('edit-host-university').value = userToEdit.hostUniversity;
    document.getElementById('edit-exchange-duration').value = userToEdit.exchangeDuration;
    document.getElementById('edit-student-number').value = userToEdit.studentNumber;
    document.getElementById('edit-country-origin').value = userToEdit.countryOrigin;
    document.getElementById('edit-city-origin').value = userToEdit.cityOrigin;
    document.getElementById('edit-address-city-origin').value = userToEdit.addressCityOrigin;
    document.getElementById('edit-document-type').value = userToEdit.documentType;
    document.getElementById('edit-document-number').value = userToEdit.documentNumber;
    document.getElementById('edit-document-expiration').value = userToEdit.documentExpiration;
    document.getElementById('edit-document-issuer').value = userToEdit.documentIssuer;

    // Mostra il modulo di modifica
    document.getElementById('user-edit-form').style.display = 'block';
}


function acceptUser(userId) {
    fetch('/api/users/approve', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` 
        },
        body: JSON.stringify({ userId, newRole: 'STUDENT' }) // o 'VOLUNTEER' a seconda del caso
    })
    .then(response => {
        if (!response.ok) throw new Error(`Errore nell'approvazione dell'utente`);
        return response.json();
    })
    .then(data => {
        alert(data.message);
        // Aggiorna la lista degli utenti
        loadPendingUsers();
    })
    .catch(error => console.error('Errore:', error));
}


function rejectUser(userId) {
    fetch('/api/users/reject', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` 
        },
        body: JSON.stringify({ userId }) // ID dell'utente da rifiutare
    })
    .then(response => {
        if (!response.ok) throw new Error(`Errore nel rifiutare l'utente`);
        return response.json();
    })
    .then(data => {
        alert(data.message);
        // Aggiorna la lista degli utenti
        loadPendingUsers();
    })
    .catch(error => console.error('Errore:', error));
}


async function saveEdit() {
    const editedUserData = {
        cardNumber: document.getElementById('edit-card-number').value,
        email: document.getElementById('edit-email').value,
        role: document.getElementById('edit-role').value,
        name: document.getElementById('edit-name').value,
        surname: document.getElementById('edit-surname').value,
        gender: document.getElementById('edit-gender').value,
        birthDate: document.getElementById('edit-birthdate').value,
        nationality: document.getElementById('edit-nationality').value,
        phoneNumber: document.getElementById('edit-phone-number').value,
        studyField: document.getElementById('edit-study-field').value,
        originUniversity: document.getElementById('edit-origin-university').value,
        hostUniversity: document.getElementById('edit-host-university').value,
        exchangeDuration: document.getElementById('edit-exchange-duration').value,
        studentNumber: document.getElementById('edit-student-number').value,
        countryOrigin: document.getElementById('edit-country-origin').value,
        cityOrigin: document.getElementById('edit-city-origin').value,
        addressCityOrigin: document.getElementById('edit-address-city-origin').value,
        documentType: document.getElementById('edit-document-type').value,
        documentNumber: document.getElementById('edit-document-number').value,
        documentExpiration: document.getElementById('edit-document-expiration').value,
        documentIssuer: document.getElementById('edit-document-issuer').value
    };

    const response = await fetch('/api/users/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Usa il token JWT
        },
        body: JSON.stringify(editedUserData)
    });

    if (!response.ok) {
        console.error('Failed to update user data:', response);
        return;
    }

    if (response.ok) {
        alert('User updated successfully');
        // Ricarica la pagina per aggiornare l'elenco degli utenti
        location.reload();
    } else {
        console.error('Failed to update user data:', response);
        alert('Failed to update user data');
    }
}
