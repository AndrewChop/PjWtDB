document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const studentItems = document.getElementById('student-items');
    const addStudentButton = document.getElementById('add-student-button');

    // Lista degli utenti 
    let students = [];

    // Funzione per filtrare la lista degli utenti in base alla ricerca
    function filterStudents(query) {
        console.log('filterStudents IN', query, students); // @mc console.log per debugging di esempio
        // @mc qua facevi filtro su "students", ma non l'avevi mai inizializzato
        const filteredStudents = students.filter(student => {
            const fullName = `${student.name} ${student.surname}`;
            return fullName.toLowerCase().includes(query.toLowerCase()) || student.cardNumber.includes(query);
        });
        console.log('filterStudents OUT', filteredStudents); // @mc console.log per debugging di esempio
        renderStudentList(filteredStudents);
    }

    // Gestione dell'evento di ricerca
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        filterStudents(query);
    });

    searchInput.addEventListener('keyup', event => {
        if (event.key === 'Enter') {
            const query = searchInput.value.trim();
            filterStudents(query);
        }
    });

    // Funzione per mostrare il form di inserimento studente
    function showStudentForm() {
        const studentForm = document.getElementById('student-form');
        studentForm.classList.remove('hidden');
    }

    // Funzione per nascondere il form di inserimento studente
    function hideStudentForm() {
        const studentForm = document.getElementById('student-form');
        studentForm.classList.add('hidden');
    }

    // Gestione dell'evento di aggiunta studente
    addStudentButton.addEventListener('click', () => {
        showStudentForm(); 
    });

    // Pulsante per confermare l'aggiunta dello studente
    const confirmAddStudentButton = document.getElementById('confirm-student');
    confirmAddStudentButton.addEventListener('click', () => {
        const studentCardNumber = document.getElementById('student-card-number').value.trim();        
        const studentEmail = document.getElementById('student-email').value.trim();
        const studentName = document.getElementById('student-name').value.trim();
        const studentSurname = document.getElementById('student-surname').value.trim();
        const studentGender = document.getElementById('student-gender').value.trim();
        const studentBirthDate = document.getElementById('student-birth-date').value.trim();
        const studentNationality = document.getElementById('student-nationality').value.trim();
        const studentPhone = document.getElementById('student-phone').value.trim();
        const studentStudyField = document.getElementById('student-study-field').value.trim();
        const studentOriginUniversity = document.getElementById('student-origin-university').value.trim();
        const studentHostUniversity = document.getElementById('student-host-university').value.trim();
        const studentExchangeDuration = document.getElementById('student-exchange-duration').value.trim();
        const studentStudentNumber = document.getElementById('student-student-number').value.trim();
        const studentAddressOrigin = document.getElementById('student-address-origin').value.trim();
        const studentCityOrigin = document.getElementById('student-city-origin').value.trim();
        const studentCountryOrigin = document.getElementById('student-country-origin').value.trim();
        const studentDocumentType = document.getElementById('student-document-type').value.trim();
        const studentNumberDoc = document.getElementById('student-number-doc').value.trim();
        const studentExpirationDate = document.getElementById('student-expiration-date').value.trim();
        const studentIssuedBy = document.getElementById('student-issued-by').value.trim();

        if (studentCardNumber && studentEmail && studentName && studentSurname && studentGender && studentBirthDate && studentNationality && studentPhone && studentStudyField && studentOriginUniversity && studentHostUniversity && studentExchangeDuration && studentStudentNumber && studentAddressOrigin && studentCityOrigin && studentCountryOrigin && studentDocumentType && studentNumberDoc && studentExpirationDate && studentIssuedBy) {
            const newStudent = {
                cardNumber: studentCardNumber,
                email: studentEmail,
                name: studentName,
                surname: studentSurname,
                gender: studentGender,
                birthDate: studentBirthDate,
                nationality: studentNationality,
                phone: studentPhone,
                studyField: studentStudyField,
                originUniversity: studentOriginUniversity,
                hostUniversity: studentHostUniversity,
                exchangeDuration: studentExchangeDuration,
                studentNumber: studentStudentNumber,
                addressOrigin: studentAddressOrigin,
                cityOrigin: studentCityOrigin,
                countryOrigin: studentCountryOrigin,
                documentType: studentDocumentType,
                numberDoc: studentNumberDoc,
                expirationDate: studentExpirationDate,
                issuedBy: studentIssuedBy
            };

            addNewStudent(newStudent);
            
            hideStudentForm();
            resetStudentFormFields();

        } else {
            alert('Please enter all student fields!');
        }
    });

    // Funzione per reimpostare i valori dei campi del form
    function resetStudentFormFields() {
        const studentCardNumber = document.getElementById('student-card-number');
        const studentEmail = document.getElementById('student-email');
        const studentName = document.getElementById('student-name');
        const studentSurname = document.getElementById('student-surname');
        const studentGender = document.getElementById('student-gender');
        const studentBirthDate = document.getElementById('student-birth-date');
        const studentNationality = document.getElementById('student-nationality');
        const studentPhone = document.getElementById('student-phone');
        const studentStudyField = document.getElementById('student-study-field');
        const studentOriginUniversity = document.getElementById('student-origin-university');
        const studentHostUniversity = document.getElementById('student-host-university');
        const studentExchangeDuration = document.getElementById('student-exchange-duration');
        const studentStudentNumber = document.getElementById('student-student-number');
        const studentAddressOrigin = document.getElementById('student-address-origin');
        const studentCityOrigin = document.getElementById('student-city-origin');
        const studentCountryOrigin = document.getElementById('student-country-origin');
        const studentDocumentType = document.getElementById('student-document-type');
        const studentNumberDoc = document.getElementById('student-number-doc');
        const studentExpirationDate = document.getElementById('student-expiration-date');
        const studentIssuedBy = document.getElementById('student-issued-by');

        // Reimposta i valori dei campi del form a stringa vuota
        studentCardNumber.value = '';
        studentEmail.value = '';
        studentName.value = '';
        studentSurname.value = '';
        studentGender.value = '';
        studentBirthDate.value = '';
        studentNationality.value = '';
        studentPhone.value = '';
        studentStudyField.value = '';
        studentOriginUniversity.value = '';
        studentHostUniversity.value = '';
        studentExchangeDuration.value = '';
        studentStudentNumber.value = '';
        studentAddressOrigin.value = '';
        studentCityOrigin.value = '';
        studentCountryOrigin.value = '';
        studentDocumentType.value = '';
        studentNumberDoc.value = '';
        studentExpirationDate.value = '';
        studentIssuedBy.value = '';
    }

    // Funzione per aggiungere un nuovo studente alla lista
    function addNewStudent(student) {
        students.push(student);
        renderStudentList(students);
        saveStudentListToLocalStorage(students);
    }
    
    function saveStudentListToLocalStorage(studentList) {
        localStorage.setItem('studentList', JSON.stringify(studentList));
    }

    // Funzione per renderizzare la lista degli studenti
    function renderStudentList(studentList) {
        const studentItems = document.getElementById('student-items');
        studentItems.innerHTML = '';

        studentList.forEach(student => {
            const studentItem = document.createElement('li');
            studentItem.innerHTML = `
                <span>${student.name} ${student.surname}</span>
                <span>${student.cardNumber}</span>
                <button class="edit-button" data-cardNumber="${student.cardNumber}">Edit</button>
                <button class="remove-button" data-cardNumber="${student.cardNumber}">Remove</button>
            `;
            studentItems.appendChild(studentItem);
        });
    }
    
    // Inizializza la lista degli studenti
    // @mc l'inizializzazione deve avvenire su students, se no non si valorizza mai
    students = JSON.parse(localStorage.getItem('studentList')) || [];
    renderStudentList(students);

    
    
    // Funzione per popolare il form di modifica con i dettagli dello studente selezionato
    function populateEditForm(student) {
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
        const editHostUniversity = document.getElementById('edit-host-university');
        const editExchangeDuration = document.getElementById('edit-exchange-duration');
        const editStudentNumber = document.getElementById('edit-student-number');
        const editAddressOrigin = document.getElementById('edit-address-origin');
        const editCityOrigin = document.getElementById('edit-city-origin');
        const editCountryOrigin = document.getElementById('edit-country-origin');
        const editDocumentType = document.getElementById('edit-document-type');
        const editNumberDoc = document.getElementById('edit-number-doc');
        const editExpirationDate = document.getElementById('edit-expiration-date');
        const editIssuedBy = document.getElementById('edit-issued-by');

        editCardNumber.value = student.cardNumber;
        editEmail.value = student.email;
        editName.value = student.name;
        editSurname.value = student.surname;
        editGender.value = student.gender;
        editBirthDate.value = student.birthDate;
        editNationality.value = student.nationality;
        editPhone.value = student.phone;
        editStudyField.value = student.studyField;
        editOriginUniversity.value = student.originUniversity;
        editHostUniversity.value = student.hostUniversity;
        editExchangeDuration.value = student.exchangeDuration;
        editStudentNumber.value = student.studentNumber;
        editAddressOrigin.value = student.addressOrigin;
        editCityOrigin.value = student.cityOrigin;
        editCountryOrigin.value = student.countryOrigin;
        editDocumentType.value = student.documentType;
        editNumberDoc.value = student.numberDoc;
        editExpirationDate.value = student.expirationDate;
        editIssuedBy.value = student.issuedBy;
        
        const studentEditForm = document.getElementById('student-edit-form');
        studentEditForm.classList.remove('hidden');
    }

    // Gestore di eventi per il click sul pulsante "Edit"
    function handleStudentItemClick(event) {
        if (event.target.classList.contains('edit-button')) {
            const cardNumber = event.target.getAttribute('data-cardNumber');

            const studentToEdit = students.find(student => student.cardNumber === cardNumber);
            
            if (studentToEdit) {
                populateEditForm(studentToEdit);
            }
        }
    }


    // Aggiungi un gestore di eventi alla lista degli studenti per gestire il click sugli elementi utente
    studentItems.addEventListener('click', handleStudentItemClick);

    // Aggiungi un gestore di eventi per il pulsante "Salva Modifiche" nel form di modifica
    const saveEditButton = document.getElementById('save-edit-button');
    saveEditButton.addEventListener('click', () => {
        // Ottieni i dettagli modificati dallo studente nel form di modifica
        const editedCardNumber = document.getElementById('edit-card-number').value.trim(); // @mc nota: se lo usi come ID per trovare un studente in una lista, non dovrebbe essere modificabile
        const editedEmail = document.getElementById('edit-email').value.trim();
        const editedName = document.getElementById('edit-name').value.trim();
        const editedSurname = document.getElementById('edit-surname').value.trim();
        const editedGender = document.getElementById('edit-gender').value.trim();
        const editedBirthDate = document.getElementById('edit-birth-date').value.trim();
        const editedNationality = document.getElementById('edit-nationality').value.trim();
        const editedPhone = document.getElementById('edit-phone').value.trim();
        const editedStudyField = document.getElementById('edit-study-field').value.trim();
        const editedOriginUniversity = document.getElementById('edit-origin-university').value.trim();
        const editedHostUniversity = document.getElementById('edit-host-university').value.trim();
        const editedExchangeDuration = document.getElementById('edit-exchange-duration').value.trim();
        const editedStudentNumber = document.getElementById('edit-student-number').value.trim();
        const editedAddressOrigin = document.getElementById('edit-address-origin').value.trim();
        const editedCityOrigin = document.getElementById('edit-city-origin').value.trim();
        const editedCountryOrigin = document.getElementById('edit-country-origin').value.trim();
        const editedDocumentType = document.getElementById('edit-document-type').value.trim();
        const editedNumberDoc = document.getElementById('edit-number-doc').value.trim();
        const editedExpirationDate = document.getElementById('edit-expiration-date').value.trim();
        const editedIssuedBy = document.getElementById('edit-issued-by').value.trim();

        // Crea un oggetto utente con i dettagli modificati
        const editedStudent = {
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
            hostUniversity: editedHostUniversity,
            exchangeDuration: editedExchangeDuration,
            studentNumber: editedStudentNumber,
            addressOrigin: editedAddressOrigin,
            cityOrigin: editedCityOrigin,
            countryOrigin: editedCountryOrigin,
            documentType: editedDocumentType,
            numberDoc: editedNumberDoc,
            expirationDate: editedExpirationDate,
            issuedBy: editedIssuedBy
        };

        // Sovrascrivi lo studente modificato nell'array "students"
        // @mc qui "studentIndex" era inesistente (la console ti segnalava un errore); ho usato il cardNumber come ID per identificare l'utente
        const indexOfStudentToEdit = students.findIndex(x => x.cardNumber === editedStudent.cardNumber);
        if(indexOfStudentToEdit !== -1) students[indexOfStudentToEdit] = editedStudent;

        // Chiudi il form di modifica
        const studentEditForm = document.getElementById('student-edit-form');
        studentEditForm.classList.add('hidden');

        // Aggiorna la lista degli utenti con le modifiche
        renderStudentList(students);

        // Salva l'array aggiornato nella localStorage
        saveStudentListToLocalStorage(students);
    });

    // Gestore di eventi per il click sul pulsante "Remove"
    function handleRemoveButtonClick(event) {
        if (event.target.classList.contains('remove-button')) {
            const cardNumber = event.target.getAttribute('data-cardNumber');

            // Trova l'indice dello studente da rimuovere nell'array "students"
            const indexOfStudentToRemove = students.findIndex(student => student.cardNumber === cardNumber);

            if (indexOfStudentToRemove !== -1) {
                // Rimuovi lo studente dall'array
                students.splice(indexOfStudentToRemove, 1);

                // Aggiorna la lista degli studenti
                renderStudentList(students);

                // Salva l'array aggiornato nella localStorage
                saveStudentListToLocalStorage(students);
            }
        }
    }

    // Aggiungi un gestore di eventi alla lista degli studenti per gestire il click sul pulsante "Remove"
    studentItems.addEventListener('click', handleRemoveButtonClick);
    
    // Trova il pulsante "Remove All" nell'HTML
    const removeAllButton = document.getElementById('remove-all-button');

    // Aggiungi un gestore di eventi per il clic sul pulsante
    removeAllButton.addEventListener('click', () => {
        students = [];        
        renderStudentList(students);        
        saveStudentListToLocalStorage(students);
    });



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

        const addStudentButton = document.getElementById('add-student-button');

        if (addStudentButton) {
            addStudentButton.addEventListener('click', function(event) {
                event.stopPropagation();
                showStudentForm();
            });
        }
    }


    
});

