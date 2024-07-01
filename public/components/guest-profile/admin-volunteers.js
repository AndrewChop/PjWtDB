document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const userItems = document.getElementById('user-items');
    const addUserButton = document.getElementById('add-user-button');

    let users = [];

    const socket = new WebSocket('ws://192.168.1.38:3000');

    socket.onopen = function () {
        console.log('WebSocket connection established');
    };

    socket.onmessage = function (event) {
        const message = JSON.parse(event.data);
        if (message.type === 'UPDATE_USER') {
            console.log('Received update:', message.payload);
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

            users = await response.json();
            renderUserList(users);
        } catch (error) {
            console.error('Failed to load users from API:', error);
        }
    }

    function isCardNumberUnique(cardNumber, excludeCardNumber = null) {
        return !users.some(user => user.cardNumber === cardNumber && user.cardNumber !== excludeCardNumber);
    }

    function isValidCardNumber(cardNumber) {
        const regex = /^\d{7}[a-zA-Z]{0,4}$/;
        return regex.test(cardNumber);
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

    function setMinExpirationDate(inputId) {
        const expirationDateInput = document.getElementById(inputId);
        const today = new Date();
        const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
        const minDate = nextYear.toISOString().split('T')[0];
        expirationDateInput.min = minDate;
    }

    function filterUsers(query) {
        const normalizedQuery = query.toLowerCase().trim();

        const filteredUsers = users.filter(user => {
            const fullName = `${user.cardNumber} ${user.name} ${user.surname}`.toLowerCase();

            if (fullName.includes(normalizedQuery) || user.cardNumber.toLowerCase().includes(normalizedQuery)) {
                return true;
            }

            const monthsPattern = /^(\d+)\s*months?$/;
            const match = normalizedQuery.match(monthsPattern);

            if (match) {
                const queryMonths = parseInt(match[1], 10);
                return queryMonths === parseInt(user.exchangeDuration, 10);
            }

            if (!isNaN(normalizedQuery) && parseInt(normalizedQuery, 10) === parseInt(user.exchangeDuration, 10)) {
                return true;
            }

            return false;
        });

        renderUserList(filteredUsers);
    }

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

    function showUserForm() {
        const userForm = document.getElementById('profile-form');
        userForm.classList.remove('hidden');
        setMinExpirationDate('user-expiration-date');
    }

    function hideUserForm() {
        const userForm = document.getElementById('profile-form');
        userForm.classList.add('hidden');
    }

    function hideEditForm() {
        const userEditForm = document.getElementById('user-edit-form');
        userEditForm.classList.add('hidden');
    }

    const cancelButton = document.getElementById('cancel-user');
    cancelButton.addEventListener('click', () => {
        hideUserForm();
    });

    const cancelEditButton = document.getElementById('cancel-edit-button');
    cancelEditButton.addEventListener('click', () => {
        hideEditForm();
    });

    addUserButton.addEventListener('click', () => {
        showUserForm(); 
    });

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
            if (!isValidCardNumber(userCardNumber)) {
                alert('Invalid card number. It must contain exactly 7 numbers and up to 4 characters.');
                return;
            }

            if (!isAtLeast18YearsOld(userBirthDate)) {
                alert('The volunteer must be at least 18 years old.');
                return;
            }

            const today = new Date();
            const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
            const minExpirationDate = nextYear.toISOString().split('T')[0];

            if (new Date(userExpirationDate) < new Date(minExpirationDate)) {
                alert('Expiration date must be at least one year from today.');
                return;
            }

            if (isCardNumberUnique(userCardNumber)) {
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
                resetUserFormFields();
            } else {
                alert('A volunteer with this card number already exists!');
            }
        } else {
            alert('Please enter all user fields!');
        }
    });

    function resetUserFormFields() {
        const userCardNumber = document.getElementById('user-card-number');
        const userEmail = document.getElementById('user-email');
        const userName = document.getElementById('user-name');
        const userSurname = document.getElementById('user-surname');
        const userGender = document.getElementById('user-gender');
        const userBirthDate = document.getElementById('user-birth-date');
        const userNationality = document.getElementById('user-nationality');
        const userPhone = document.getElementById('user-phone');
        const userStudyField = document.getElementById('user-study-field');
        const userOriginUniversity = document.getElementById('user-origin-university');
        const userStudentNumber = document.getElementById('user-student-number');
        const userAddressOrigin = document.getElementById('user-address-origin');
        const userCityOrigin = document.getElementById('user-city-origin');
        const userCountryOrigin = document.getElementById('user-country-origin');
        const userDocumentType = document.getElementById('user-document-type');
        const userNumberDoc = document.getElementById('user-number-doc');
        const userExpirationDate = document.getElementById('user-expiration-date');
        const userIssuedBy = document.getElementById('user-issued-by');

        userCardNumber.value = '';
        userEmail.value = '';
        userName.value = '';
        userSurname.value = '';
        userGender.value = '';
        userBirthDate.value = '';
        userNationality.value = '';
        userPhone.value = '';
        userStudyField.value = '';
        userOriginUniversity.value = '';
        userStudentNumber.value = '';
        userAddressOrigin.value = '';
        userCityOrigin.value = '';
        userCountryOrigin.value = '';
        userDocumentType.value = '';
        userNumberDoc.value = '';
        userExpirationDate.value = '';
        userIssuedBy.value = '';
    }

    function addNewUser(user) {
        users.push(user);
        renderUserList(users);
        saveUserListToLocalStorage(users);
    }

    function saveUserListToLocalStorage(userList) {
        localStorage.setItem('userList', JSON.stringify(userList));
    }

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

    loadVolunteersFromAPI();

    users = JSON.parse(localStorage.getItem('userList')) || [];
    renderUserList(users);

    function handleUserItemClick(event) {
        if (event.target.classList.contains('edit-button')) {
            const cardNumber = event.target.getAttribute('data-cardNumber');

            const userToEdit = users.find(user => user.cardNumber === cardNumber);
            
            if (userToEdit) {
                populateEditForm(userToEdit, cardNumber);
                const userIndex = users.findIndex(u => u.cardNumber === userToEdit.cardNumber);
                if (userIndex !== -1) {
                    users[userIndex] = userToEdit;
                }
            }
        }
    }

    userItems.addEventListener('click', handleUserItemClick);

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

        setMinExpirationDate('edit-expiration-date');

        const userEditForm = document.getElementById('user-edit-form');
        userEditForm.classList.remove('hidden');
    }

    const saveEditButton = document.getElementById('save-edit-button');
    saveEditButton.addEventListener('click', () => {
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

        if (!isAtLeast18YearsOld(editedBirthDate)) {
            alert('The volunteer must be at least 18 years old.');
            return;
        }

        const today = new Date();
        const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
        const minExpirationDate = nextYear.toISOString().split('T')[0];

        if (new Date(editedExpirationDate) < new Date(minExpirationDate)) {
            alert('Expiration date must be at least one year from today.');
            return;
        }

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

        const indexOfUserToEdit = users.findIndex(x => x.cardNumber === editedUser.cardNumber);
        if (indexOfUserToEdit !== -1) users[indexOfUserToEdit] = editedUser;

        const userEditForm = document.getElementById('user-edit-form');
        userEditForm.classList.add('hidden');

        renderUserList(users);

        saveUserListToLocalStorage(users);
    });

    function handleRemoveButtonClick(event) {
        if (event.target.classList.contains('remove-button')) {
            const cardNumber = event.target.getAttribute('data-cardNumber');

            const indexOfUserToRemove = users.findIndex(user => user.cardNumber === cardNumber);

            if (indexOfUserToRemove !== -1) {
                users.splice(indexOfUserToRemove, 1);
                saveUserListToLocalStorage(users);
            } else {
                console.error("User not found in the array."); 
            }
            renderUserList(users);
        }
    }

    userItems.addEventListener('click', handleRemoveButtonClick);

    const removeAllButton = document.getElementById('remove-all-button');
    removeAllButton.addEventListener('click', () => {
        users = [];        
        renderUserList(users);        
        saveUserListToLocalStorage(users);
    });
});

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
