document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    document.getElementById('save-button').addEventListener('click', saveChanges);
    document.getElementById('delete-button').addEventListener('click', deleteAccount);
});

async function loadUserData() {
    try {
        let token = localStorage.getItem('jwtToken');
        if (!token) {
            console.error('Token not available');
            alert('You are not authenticated! Please login.');
            window.location.href = '../index.html';
            return; 
        }
        console.log('Token (PROFILE):', token);

        let response = await fetch('/api/user/data', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.status === 401) {
            alert('Session expired or invalid! Please log in again.');
            window.location.href = '../../index.html'; // Reindirizza all'login
        }

        if (!response.ok) {
            throw new Error('Failed to load user data');
        }
        console.log('User data loaded successfully');
        const userData = await response.json();
        populateForm(userData);
    } catch (error) {
        console.error('Error loading user data:', error);
        alert('An error occurred: ' + error.message);
    }
}

function populateForm(userData) {
    document.getElementById('user-card-number').value = userData.cardNumber;
    document.getElementById('user-email').value = userData.email;
    document.getElementById('user-role').value = userData.role;
    document.getElementById('user-name').value = userData.name;
    document.getElementById('user-surname').value = userData.surname;
    document.getElementById('user-gender').value = userData.gender;
    document.getElementById('user-birth-date').value = formatDateForInput(userData.birthDate);
    document.getElementById('user-nationality').value = userData.nationality;
    document.getElementById('user-phone-number').value = userData.phoneNumber;
    document.getElementById('user-study-field').value = userData.studyField;
    document.getElementById('user-origin-university').value = userData.originUniversity;
    document.getElementById('user-student-number').value = userData.studentNumber;
    document.getElementById('user-country-origin').value = userData.countryOfOrigin;
    document.getElementById('user-city-origin').value = userData.cityOfOrigin;
    document.getElementById('user-address-origin').value = userData.addressCityOfOrigin;
    document.getElementById('user-document-type').value = userData.documentType;
    document.getElementById('user-number-doc').value = userData.documentNumber;
    document.getElementById('user-expiration-date').value = formatDateForInput(userData.documentExpiration);
    document.getElementById('user-issued-by').value = userData.documentIssuer;
}

function formatDateForInput(dateString) {
    if (!dateString) return ''; // Gestione di date non valide o nulle
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function unformatDateForInput(dateString) {
    if (!dateString) return ''; // Gestione di date non valide o nulle
    const [year, month, day] = dateString.split('-');
    return `${year}-${month}-${day}`;
}

async function saveChanges() {
    const token = localStorage.getItem('jwtToken');
    const birthDate = document.getElementById('user-birth-date').value;
    const expirationDate = document.getElementById('user-expiration-date').value;

    // Funzione per convalidare il cardNumber
    function isValidCardNumber(cardNumber) {
        const regex = /^\d{7}[a-zA-Z]{0,4}$/;
        return regex.test(cardNumber);
    }

    // Funzione per convalidare l'età
    function isAtLeast18YearsOld(birthDate) {
        const today = new Date();
        const birthDateObj = new Date(birthDate);
        const age = today.getFullYear() - birthDateObj.getFullYear();
        const monthDifference = today.getMonth() - birthDateObj.getMonth();
        const dayDifference = today.getDate() - birthDateObj.getDate();
        
        if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
            return age - 1 >= 18;
        }
        return age >= 18;
    }

    // Funzione per impostare la data minima per l'expiration date
    function isValidExpirationDate(expirationDate) {
        const today = new Date();
        const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
        return new Date(expirationDate) >= nextYear;
    }

    const userData = {
        cardNumber: document.getElementById('user-card-number').value,
        email: document.getElementById('user-email').value,
        role: document.getElementById('user-role').value,
        name: document.getElementById('user-name').value,
        surname: document.getElementById('user-surname').value,
        gender: document.getElementById('user-gender').value,
        birthDate: birthDate ? unformatDateForInput(birthDate) : null,
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
        documentExpiration: expirationDate ? unformatDateForInput(expirationDate) : null,
        documentIssuer: document.getElementById('user-issued-by').value
    };

    console.log("Data to be sent:", userData);

    // Convalida i campi
    let validationErrors = [];

    if (!isValidCardNumber(userData.cardNumber)) {
        validationErrors.push('Invalid card number. It must contain exactly 7 numbers and up to 4 characters.');
    }

    if (!isAtLeast18YearsOld(userData.birthDate)) {
        validationErrors.push('The user must be at least 18 years old.');
    }

    if (!isValidExpirationDate(userData.documentExpiration)) {
        validationErrors.push('Expiration date must be at least one year from today.');
    }

    if (validationErrors.length > 0) {
        alert(validationErrors.join('\n'));
        return;
    }

    try {
        const response = await fetch('/api/user/update', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert('Session expired or invalid! Please log in again.');
                window.location.href = '../../index.html'; // Reindirizza all'login
            } else {
                console.error('Failed to save user data:', response);
                alert('Failed to update user data');
            }
            return;
        } else {
            console.log('User data saved successfully');
            alert('Profile updated successfully!');
            loadUserData();
        }
    } catch (error) {
        console.error('Error saving user data:', error);
    }
}

async function deleteAccount() {
    const confirmation = confirm('Are you sure you want to delete your account? This action is irreversible.');
    if (!confirmation) return;

    try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch('/api/user/delete', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            alert('Account successfully deleted. You will be logged out.');
            localStorage.removeItem('jwtToken');
            window.location.href = '../../index.html';
        } else {
            throw new Error('Error while deleting the account.');
        }
    } catch (error) {
        console.error('Errore:', error);
        alert('Unable to delete the account. Please try again later.');
    }
}