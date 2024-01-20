document.getElementById('profile-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Recuperare il token JWT dal localStorage
    const token = localStorage.getItem('jwtToken');
    console.log("Token recuperato:", token); // Aggiungi questa linea per visualizzare il token

    // Raccogliere i dati dal form
    const formData = {
        cardNumber: document.getElementById('card-number').value,
        name: document.getElementById('name').value,
        surname: document.getElementById('surname').value,
        gender: document.getElementById('gender').value,
        birthDate: document.getElementById('birth-date').value,
        nationality: document.getElementById('nationality').value,
        phoneNumber: document.getElementById('phone').value,
        studyField: document.getElementById('study-field').value,
        originUniversity: document.getElementById('origin-university').value,
        hostUniversity: document.getElementById('host-university').value,
        exchangeDuration: document.getElementById('exchange-duration').value,
        studentNumber: document.getElementById('student-number').value,
        countryOfOrigin: document.getElementById('country-origin').value,
        cityOfOrigin: document.getElementById('city-origin').value,
        addressCityOfOrigin: document.getElementById('address-origin').value,
        documentType: document.getElementById('document-type').value,
        documentNumber: document.getElementById('number-doc').value,
        documentExpiration: document.getElementById('expiration-date').value,
        documentIssuer: document.getElementById('issued-by').value
    };

    // Invio dei dati al server
    fetch('/api/user/update', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Utilizza il token recuperato
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Errore nella completamento del profilo');
        }
        return response.json();
    })
    .then(data => {
        // Qui puoi gestire la risposta del server, ad esempio reindirizzando l'utente
        alert('Profilo completato con successo!');
        if (formData.role === 'STUDENT') {
            window.location.href = 'homepage_student.html';
        } else {
            window.location.href = 'homepage.html';
        }
    })
    .catch(error => {
        alert(error.message);
    });
});
