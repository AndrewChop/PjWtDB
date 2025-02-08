document.addEventListener('DOMContentLoaded', async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    /* console.log('URL:', window.location.href);
    console.log('TOKEN from URL:', token); */

     if (token) {
        //console.log('Token salvato nel localStorage', token);
        localStorage.setItem('jwtToken', token);
    } else {
        alert('Session expired! Please re-login.');
        window.location.href = '../index.html';
        return;
    } 

    try {
        const response = await fetch('/api/verify-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            //console.log("Qui è presente un errore: " + errorMessage);
            throw new Error(errorMessage || 'Token invalid or expired.');
        }

        //console.log('Token is valid');
    } catch (error) {
        console.error('Error verifying token:', error);
        alert('Session expired! Please re-login. <--');
        window.location.href = '../index.html';
        return;
    }

    //console.log('Page loaded correctly!');

    document.getElementById('profile-form').addEventListener('submit', handleProfileFormSubmit);

    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function () {
            this.value = this.value.toUpperCase();
        });
    }
});

async function handleProfileFormSubmit(event) {
    event.preventDefault();

    const formData = {
        cardNumber: document.getElementById('card-number').value.trim(),
        role: document.getElementById('role').value,
        name: document.getElementById('name').value.trim(),
        surname: document.getElementById('surname').value.trim(),
        gender: document.getElementById('gender').value,
        birthDate: document.getElementById('birthdate').value,
        nationality: document.getElementById('nationality').value.trim(),
        phoneNumber: document.getElementById('phone').value.trim(),
        studyField: document.getElementById('study-field').value.trim(),
        originUniversity: document.getElementById('origin-university').value.trim(),
        studentNumber: document.getElementById('student-number').value.trim(),
        countryOfOrigin: document.getElementById('country-origin').value.trim(),
        cityOfOrigin: document.getElementById('city-origin').value.trim(),
        addressCityOfOrigin: document.getElementById('address-origin').value.trim(),
        documentType: document.getElementById('document-type').value,
        documentNumber: document.getElementById('number-doc').value.trim(),
        documentExpiration: document.getElementById('expiration-date').value,
        documentIssuer: document.getElementById('issued-by').value.trim()
    };

    //console.log('Form data:', formData);

    const validationErrors = validateProfileForm(formData);

    if (validationErrors.length > 0) {
        alert(validationErrors.join('\n'));
        return;
    }

    const token = localStorage.getItem('jwtToken');
    //console.log("Verifica del token:" + token);

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
                throw new Error('Failed to update user data');
            }
        }

        alert('Profile completed successfully!');
        window.location.href = 'homepage.html';
    } catch (error) {
        console.error('Error saving user data:', error);
        alert('An error occurred while saving your profile. Please try again.');
    }
}

function validateProfileForm(formData) {
    const errors = [];

    if (!/^[0-9]{7}[a-zA-Z]{0,4}$/.test(formData.cardNumber)) {
        errors.push('Invalid ESNCard Number! It must contain exactly 7 digits and up to 4 characters.');
    }

    if (!isAtLeast18YearsOld(formData.birthDate)) {
        errors.push('You must be at least 18 years old.');
    }

    if (!isValidExpirationDate(formData.documentExpiration)) {
        errors.push('Document expiration date must be at least 1 year from today.');
    }

    return errors;
}

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

function isValidExpirationDate(expirationDate) {
    const today = new Date();
    const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
    return new Date(expirationDate) >= nextYear;
}