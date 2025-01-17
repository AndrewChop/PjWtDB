document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('jwtToken');
    console.log('Token retrieved for profile:', token);
    if (!token) {
        alert('Session expired! Please re-login.');
        window.location.href = '../index.html';
    }

    // Configura il valore minimo per il campo expiration date
    const expirationDateInput = document.getElementById('expiration-date');
    const today = new Date();
    const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
    expirationDateInput.min = nextYear.toISOString().split('T')[0];

    const cardNumberInput = document.getElementById('card-number');
    cardNumberInput.addEventListener('input', function () {
        this.value = this.value.toUpperCase();
    });

});

document.getElementById('profile-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Raccogliere i dati dal form
    const formData = {
        cardNumber: document.getElementById('card-number').value,
        role: document.getElementById('role').value,
        name: document.getElementById('name').value,
        surname: document.getElementById('surname').value,
        gender: document.getElementById('gender').value,
        birthDate: document.getElementById('birthdate').value,
        nationality: document.getElementById('nationality').value,
        phoneNumber: document.getElementById('phone').value,
        studyField: document.getElementById('study-field').value,
        originUniversity: document.getElementById('origin-university').value,
        studentNumber: document.getElementById('student-number').value,
        countryOfOrigin: document.getElementById('country-origin').value,
        cityOfOrigin: document.getElementById('city-origin').value,
        addressCityOfOrigin: document.getElementById('address-origin').value,
        documentType: document.getElementById('document-type').value,
        documentNumber: document.getElementById('number-doc').value,
        documentExpiration: document.getElementById('expiration-date').value,
        documentIssuer: document.getElementById('issued-by').value
    };

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

    // Funzione per convalidare la data di scadenza
    function isValidExpirationDate(expirationDate) {
        const today = new Date();
        const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
        return new Date(expirationDate) >= nextYear;
    }

    // Convalida i campi
    let validationErrors = [];

    if (!isValidCardNumber(formData.cardNumber)) {
        validationErrors.push('Invalid card number. It must contain exactly 7 numbers and up to 4 characters.');
    }

    if (!isAtLeast18YearsOld(formData.birthDate)) {
        validationErrors.push('The user must be at least 18 years old.');
    }

    if (!isValidExpirationDate(formData.documentExpiration)) {
        validationErrors.push('Expiration date must be at least one year from today.');
    }

    if (validationErrors.length > 0) {
        alert(validationErrors.join('\n'));
        return;
    }

    const token = localStorage.getItem('jwtToken');

    try {
        const response = await fetch('/api/user/update', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert('Session expired or invalid! Please log in again.');
                window.location.href = '../index.html'; 
            } else {
                console.error('Failed to save user data:', response);
            }
            return response.json();
        } else {
            console.log('User data saved successfully');
            alert('Profile updated successfully!');
            window.location.href = 'homepage.html';
        }
    } catch (error) {
        console.error('Error saving user data:', error);
        alert(error.message);
    }
});