document.addEventListener('DOMContentLoaded', async function () {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const studentItems = document.getElementById('student-items');
    const addStudentButton = document.getElementById('add-student-button');
    const cardInput = document.getElementById('student-card-number');

    let students = [];
    
    let originalCardNumber = '';

    const socket = new WebSocket(window.config.webSocketUrl);
    //console.log("WebSocket initialized:", window.config.webSocketUrl);


    socket.onopen = function () {
        //console.log('WebSocket connection established');
    };

    socket.onmessage = function (event) {
        //console.log('Message received:', event.data);
        if (event.data === "Welcome in the server WebSocket!") {
            //console.log("Received welcome message, not a JSON, skipping parsing.");
            return;
        }
        try {
            const message = JSON.parse(event.data);
            if (message.type === 'ADD_STUDENT') {
                //console.log('Received add:', message.payload);
                const newStudent = message.payload;
                if (!students.some(student => student.id === newStudent.id)) {
                    students.push(newStudent);
                    renderStudentList(students);
                }
            } else if (message.type === 'UPDATE_STUDENT') {
                //console.log('Received update:', message.payload);
                const updatedStudent = message.payload;
                const indexOfStudentToUpdate = students.findIndex(student => student.id === updatedStudent.id);
                if (indexOfStudentToUpdate !== -1) {
                    students[indexOfStudentToUpdate] = updatedStudent;
                }
                renderStudentList(students);
            } else if (message.type === 'REMOVE_STUDENT') {
                //console.log('Received remove:', message.payload);
                const removedStudent = message.payload;
                students = students.filter(student => student.id !== removedStudent.id);
                renderStudentList(students);
            }
        } catch (error) {
            console.error('Failed to parse message:', error);
        }
    };

    socket.onclose = function () {
        //console.log('WebSocket connection closed');
    };

    async function loadStudentsFromAPI() {
        try {
            const token = localStorage.getItem('jwtToken');
            const response = await fetch(`/api/users/students`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const apiStudents = await response.json();

            apiStudents.forEach(apiStudent => {
                if (!students.some(student => student.id === apiStudent.id)) {
                    students.push(apiStudent);
                }
            });
            renderStudentList(students);
        } catch (error) {
            console.error('Failed to load users from API:', error);
        }
    }

    function renderStudentList(studentList) {
        const studentItems = document.getElementById('student-items');
        if (students.length === 0) {
            studentItems.innerHTML = "<p>No students found.</p>";
        } else {
            studentItems.innerHTML = '';

            studentList.forEach(student => {
                const studentItem = document.createElement('li');
                studentItem.innerHTML = `
                    <span>${student.name} ${student.surname}</span>
                    <span>${student.email}</span>
                    <span>${student.cardNumber}</span>
                    <span>${student.exchangeDuration} months</span>
                    <button class="edit-button" data-cardNumber="${student.cardNumber}">Edit</button>
                    <button class="remove-button" data-cardNumber="${student.cardNumber}">Remove</button>
                `;
                studentItems.appendChild(studentItem);
            });
        }
    }

    function isCardNumberUnique(cardNumber, excludeCardNumber = null) {
        return !students.some(student => student.cardNumber === cardNumber && student.cardNumber !== excludeCardNumber);
    }

    function isValidCardNumber(cardNumber) {
        const regex = /^\d{7}[a-zA-Z]{0,4}$/;
        return regex.test(cardNumber);
    }

    cardInput.addEventListener('input', function () {
        this.value = this.value.toUpperCase();
    });

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

    function setMinExpirationDate(inputId) {
        const expirationDateInput = document.getElementById(inputId);
        const today = new Date();
        const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()+1);
        const minDate = nextYear.toISOString().split('T')[0]; 
        expirationDateInput.min = minDate;
    }

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

    function filterStudents(query) {
        const normalizedQuery = query.toLowerCase().trim();

        const filteredStudents = students.filter(student => {
            const fullName = `${student.cardNumber} ${student.name} ${student.surname} ${student.email} ${student.exchangeDuration}`.toLowerCase();

            if (fullName.includes(normalizedQuery) || student.cardNumber.toLowerCase().includes(normalizedQuery)) {
                return true;
            }

            const monthsPattern = /^(\d+)\s*months?$/;
            const match = normalizedQuery.match(monthsPattern);

            if (match) {
                const queryMonths = parseInt(match[1], 10);
                return queryMonths === parseInt(student.exchangeDuration, 10);
            }

            if (!isNaN(normalizedQuery) && parseInt(normalizedQuery, 10) === parseInt(student.exchangeDuration, 10)) {
                return true;
            }

            return false;
        });

        renderStudentList(filteredStudents);
    }

    addStudentButton.addEventListener('click', () => {
        showStudentForm(); 
    });

    function showStudentForm() {
        const studentForm = document.getElementById('student-form');
        studentForm.classList.remove('hidden');
        setMinExpirationDate('student-expiration-date');
    }

    function hideStudentForm() {
        const studentForm = document.getElementById('student-form');
        studentForm.classList.add('hidden');
    }

    function hideEditForm() {
        const studentEditForm = document.getElementById('student-edit-form');
        studentEditForm.classList.add('hidden');
    }

    const cancelStudentButton = document.getElementById('cancel-student');
    cancelStudentButton.addEventListener('click', () => {
        hideStudentForm();
    });

    const cancelEditButton = document.getElementById('cancel-edit-button');
    cancelEditButton.addEventListener('click', () => {
        hideEditForm();
    });    

    const confirmAddStudentButton = document.getElementById('confirm-student');
    confirmAddStudentButton.addEventListener('click', async () => {
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
            let validationErrors = [];

            if (!isValidCardNumber(studentCardNumber)) {
                validationErrors.push('Invalid card number. It must contain exactly 7 numbers and up to 4 characters.');
            }

            if (!isAtLeast18YearsOld(studentBirthDate)) {
                validationErrors.push('The student must be at least 18 years old.');
            }

            const today = new Date();
            const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
            const minExpirationDate = nextYear.toISOString().split('T')[0];

            if (new Date(studentExpirationDate) < new Date(minExpirationDate)) {
                validationErrors.push('Expiration date must be at least one year from today.');
            }

            if (validationErrors.length > 0) {
                alert(validationErrors.join('\n'));
                return;
            }

            if (isCardNumberUnique(studentCardNumber)) {
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
                    addressCityOfOrigin: studentAddressOrigin,
                    cityOfOrigin: studentCityOrigin,
                    countryOfOrigin: studentCountryOrigin,
                    documentType: studentDocumentType,
                    documentNumber: studentNumberDoc,
                    documentExpiration: studentExpirationDate,
                    documentIssuer: studentIssuedBy
                };

                try {
                    const token = localStorage.getItem('jwtToken');
                    const response = await fetch('/api/student/add', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(newStudent)
                    });

                    if (!response.ok) {
                        throw new Error('Failed to add student');
                    }

                    const savedStudent = await response.json();

                    if (!students.find(student => student.cardNumber === savedStudent.cardNumber)) {
                        students.push(savedStudent);
                    }

                    resetStudentFormFields(); 
                    hideStudentForm();
                } catch (error) {
                    console.error('Error adding student:', error);
                }
            } else {
                alert('A student with this card number already exists!');
            }
        } else {
            alert('Please enter all student fields!');
        }
    });

    function resetStudentFormFields() {
        document.getElementById('student-card-number').value = '';
        document.getElementById('student-email').value = '';
        document.getElementById('student-name').value = '';
        document.getElementById('student-surname').value = '';
        document.getElementById('student-gender').value = '';
        document.getElementById('student-birth-date').value = '';
        document.getElementById('student-nationality').value = '';
        document.getElementById('student-phone').value = '';
        document.getElementById('student-study-field').value = '';
        document.getElementById('student-origin-university').value = '';
        document.getElementById('student-host-university').value = '';
        document.getElementById('student-exchange-duration').value = '';
        document.getElementById('student-student-number').value = '';
        document.getElementById('student-address-origin').value = '';
        document.getElementById('student-city-origin').value = '';
        document.getElementById('student-country-origin').value = '';
        document.getElementById('student-document-type').value = '';
        document.getElementById('student-number-doc').value = '';
        document.getElementById('student-expiration-date').value = '';
        document.getElementById('student-issued-by').value = '';
    }

    function populateEditForm(student) {
        console.error('Student:', student);
        document.getElementById('edit-card-number').value = student.cardNumber;
        document.getElementById('edit-email').value = student.email;
        document.getElementById('edit-name').value = student.name;
        document.getElementById('edit-surname').value = student.surname;
        document.getElementById('edit-gender').value = student.gender;
        document.getElementById('edit-birth-date').value = (student.birthDate).split("T")[0];
        document.getElementById('edit-nationality').value = student.nationality;
        document.getElementById('edit-phone').value = student.phoneNumber;
        document.getElementById('edit-study-field').value = student.studyField;
        document.getElementById('edit-origin-university').value = student.originUniversity;
        document.getElementById('edit-host-university').value = student.hostUniversity;
        document.getElementById('edit-exchange-duration').value = student.exchangeDuration;
        document.getElementById('edit-student-number').value = student.studentNumber;
        document.getElementById('edit-address-origin').value = student.addressCityOfOrigin;
        document.getElementById('edit-city-origin').value = student.cityOfOrigin;
        document.getElementById('edit-country-origin').value = student.countryOfOrigin;
        document.getElementById('edit-document-type').value = student.documentType;
        document.getElementById('edit-number-doc').value = student.documentNumber;
        document.getElementById('edit-expiration-date').value = student.documentExpiration? (student.documentExpiration).split("T")[0] : '';
        document.getElementById('edit-issued-by').value = student.documentIssuer;

        originalCardNumber = student.cardNumber;

        setMinExpirationDate('edit-expiration-date');

        const studentEditForm = document.getElementById('student-edit-form');
        studentEditForm.classList.remove('hidden');

        const saveEditButton = document.getElementById('save-edit-button');
        saveEditButton.setAttribute('data-id', student.id);
    }

    function handleStudentItemClick(event) {
        if (event.target.classList.contains('edit-button')) {
            const cardNumber = event.target.getAttribute('data-cardNumber');

            const studentToEdit = students.find(student => student.cardNumber === cardNumber);

            if (studentToEdit) {
                populateEditForm(studentToEdit);
            }
        } else if (event.target.classList.contains('remove-button')) {
            const cardNumber = event.target.getAttribute('data-cardNumber');
            //console.log('Card number:', cardNumber);
            removeStudent(cardNumber);
        }
    }

    const removeAllStudentsButton = document.getElementById('remove-all-button');

    removeAllStudentsButton.addEventListener('click', async () => {
        students.forEach(student => {
            removeStudent(student.cardNumber);
        })
    });

    async function removeStudent(cardNumber) {
        try {
            console.log('Removing student with cardNumber:', cardNumber);
            
            const token = localStorage.getItem('jwtToken');
            const response = await fetch('/api/student/remove', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ cardNumber })
            });

            if (!response.ok) {
                throw new Error('Failed to remove student');
            }

            const result = await response.json();
            students = students.filter(student => student.cardNumber !== cardNumber);
            renderStudentList(students);
            console.log('Student removed successfully:', result);
        } catch (error) {
            console.error('Error removing student:', error);
        }
    }

    studentItems.addEventListener('click', handleStudentItemClick);

    const saveEditButton = document.getElementById('save-edit-button');
    saveEditButton.addEventListener('click', async () => {
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

        if (editedCardNumber !== originalCardNumber) {
            alert('You cannot change the card number.');
            return;
        }

        let validationErrors = [];

        if (!isAtLeast18YearsOld(editedBirthDate)) {
            validationErrors.push('The student must be at least 18 years old.');
        }

        const today = new Date();
        const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
        const minExpirationDate = nextYear.toISOString().split('T')[0];

        if (new Date(editedExpirationDate) < new Date(minExpirationDate)) {
            validationErrors.push('Expiration date must be at least one year from today.');
        }

        if (validationErrors.length > 0) {
            alert(validationErrors.join('\n'));
            return;
        }

        const studentId = saveEditButton.getAttribute('data-id');

        const editedStudent = {
            id: studentId,
            studentId: originalCardNumber,
            cardNumber: editedCardNumber,
            email: editedEmail,
            name: editedName,
            surname: editedSurname,
            gender: editedGender,
            birthDate: editedBirthDate,
            nationality: editedNationality,
            phoneNumber: editedPhone,
            studyField: editedStudyField,
            originUniversity: editedOriginUniversity,
            hostUniversity: editedHostUniversity,
            exchangeDuration: editedExchangeDuration,
            studentNumber: editedStudentNumber,
            addressCityOfOrigin: editedAddressOrigin,
            cityOfOrigin: editedCityOrigin,
            countryOfOrigin: editedCountryOrigin,
            documentType: editedDocumentType,
            documentNumber: editedNumberDoc,
            documentExpiration: editedExpirationDate || null,
            documentIssuer: editedIssuedBy
        };

        try {
            const token = localStorage.getItem('jwtToken');
            const response = await fetch('/api/student/update', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editedStudent)
            });

            if (!response.ok) {
                throw new Error('Failed to update student');
            }

            const result = await response.json();
            //console.log('Student updated successfully:', result);
            const index = students.findIndex(student => student.id === parseInt(studentId));
            if (index !== -1) {
                students[index] = result;
                renderStudentList(students);
            }

            hideEditForm();
        } catch (error) { 
            console.error('Error updating student:', error);
        }
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

    loadStudentsFromAPI();    
});
