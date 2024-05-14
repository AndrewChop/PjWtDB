document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    document.getElementById('save-button').addEventListener('click', saveChanges);
});

async function loadUserData() {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        console.error('Token non disponibile');
        alert('Non sei autenticato. Effettua il login.');
        return; 
    }
    console.log(token);

    const response = await fetch('/api/user/data', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.ok) {
        if (response.status === 401) {
            alert('Sessione scaduta o non valida. Si prega di rieffettuare il login.');
            window.location.href = '/login.html'; // Reindirizza all'login
        } else {
            console.error('Failed to load user data:', response);
        }
        return;
    } else {
        console.log('User data loaded successfully');
        const userData = await response.json();
        populateForm(userData);
    }

}

function populateForm(userData) {
    for (let key in userData) {
        const input = document.getElementById(`user-${key}`);
        if (input) {
            input.value = userData[key];
            if (input.value) {
                input.classList.add('input-filled');
            }
        }
    }
}

async function saveChanges() {
    const token = localStorage.getItem('jwtToken');
    const userData = {
        cardNumber: document.getElementById('user-card-number').value,
        email: document.getElementById('user-email').value,
        role: document.getElementById('user-role').value,
        name: document.getElementById('user-name').value,
        surname: document.getElementById('user-surname').value,
        gender: document.getElementById('user-gender').value,
        birthDate: document.getElementById('user-birthdate').value,
        nationality: document.getElementById('user-nationality').value,
        phoneNumber: document.getElementById('user-phone-number').value,
        studyField: document.getElementById('user-study-field').value,
        originUniversity: document.getElementById('user-origin-university').value,
        studentNumber: document.getElementById('user-student-number').value,
        countryOfOrigin: document.getElementById('user-country-origin').value,
        cityOfOrigin: document.getElementById('user-city-origin').value,
        addressCityOfOrigin: document.getElementById('user-address-origin').value,
        documentType: document.getElementById('user-document-type').value,
        documentNumber: document.getElementById('user-number-doc').value,
        documentExpiration: document.getElementById('user-expiration-date').value,
        documentIssuer: document.getElementById('user-issued-by').value
    };

    const response = await fetch('/api/user/update', {
        method: 'POST', 
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
    });

    if (!response.ok) {
        console.error('Failed to update user data:', response);
        alert('Failed to update user data');
        return;
    } else {
        console.log('Profile updated successfully');
        alert('Profile updated successfully');
        loadUserData();
    }

}

