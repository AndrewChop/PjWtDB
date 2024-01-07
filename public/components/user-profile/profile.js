document.addEventListener('DOMContentLoaded', function () {
    // Funzione per salvare i dati
    function saveChanges() {
        const numberCard = document.getElementById('number-card').value;
        const email = document.getElementById('email').value;
        const name = document.getElementById('name').value;
        const surname = document.getElementById('surname').value;
        const gender = document.getElementById('gender').value;
        const birthdate = document.getElementById('birthdate').value;
        const nationality = document.getElementById('nationality').value;
        const phoneNumber = document.getElementById('phone-number').value;
        const studyField = document.getElementById('study-field').value;
        const originUniversity = document.getElementById('origin-university').value;
        const hostUniversity = document.getElementById('host-university').value;
        const exchangeDuration = document.getElementById('exchange-duration').value;
        const studentNumber = document.getElementById('student-number').value;
        const addressOrigin = document.getElementById('address-origin').value;
        const cityOrigin = document.getElementById('city-origin').value;
        const countryOrigin = document.getElementById('country-origin').value;
        const addressHost = document.getElementById('address-host').value;
        const cityHost = document.getElementById('city-host').value;
        const numberDoc = document.getElementById('number-doc').value;
        const documentType = document.getElementById('document-type').value;
        const expiration = document.getElementById('expiration').value;
        const issuedBy = document.getElementById('issued-by').value;
    
        const userData = {
            numberCard,
            email,
            name,
            surname,
            gender,
            birthdate,
            nationality,
            phoneNumber,
            studyField,
            originUniversity,
            hostUniversity,
            exchangeDuration,
            studentNumber,
            addressOrigin,
            cityOrigin,
            countryOrigin,
            addressHost,
            cityHost,
            numberDoc,
            documentType,
            expiration,
            issuedBy
        };

        const userDataJSON = JSON.stringify(userData);
        localStorage.setItem('userData', userDataJSON);
        alert('I tuoi dati sono stati salvati con successo!');
    }

    const saveChangesButton = document.getElementById('save-button');
    saveChangesButton.addEventListener('click', saveChanges);

    loadUserData();

});

// Funzione per caricare i dati
function loadUserData() {
    const userDataJSON = localStorage.getItem('userData');
    if (userDataJSON) {
        const userData = JSON.parse(userDataJSON);
        document.getElementById('number-card').value = userData.numberCard;
        document.getElementById('email').value = userData.email;
        document.getElementById('name').value = userData.name;
        document.getElementById('surname').value = userData.surname;
        document.getElementById('gender').value = userData.gender;
        document.getElementById('birthdate').value = userData.birthdate;
        document.getElementById('nationality').value = userData.nationality;
        document.getElementById('phone-number').value = userData.phoneNumber;
        document.getElementById('study-field').value = userData.studyField;
        document.getElementById('origin-university').value = userData.originUniversity;
        document.getElementById('host-university').value = userData.hostUniversity;
        document.getElementById('exchange-duration').value = userData.exchangeDuration;
        document.getElementById('student-number').value = userData.studentNumber;
        document.getElementById('address-origin').value = userData.addressOrigin;
        document.getElementById('city-origin').value = userData.cityOrigin;
        document.getElementById('country-origin').value = userData.countryOrigin;
        document.getElementById('address-host').value = userData.addressHost;
        document.getElementById('city-host').value = userData.cityHost;
        document.getElementById('number-doc').value = userData.numberDoc;
        document.getElementById('document-type').value = userData.documentType;
        document.getElementById('expiration').value = userData.expiration;
        document.getElementById('issued-by').value = userData.issuedBy;
    }
}
