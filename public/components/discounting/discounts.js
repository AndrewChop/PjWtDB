document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const discountItems = document.getElementById('discount-items');
    const addDiscountButton = document.getElementById('add-discount-button');

    // Lista degli eventi
    let discounts = [];

    const socket = new WebSocket(window.config.webSocketUrl);
    console.log("WebSocket initialized:", window.config.webSocketUrl);

    socket.onopen = function () {
        console.log('WebSocket connection established');
    };

    socket.onmessage = function (discount) {
        console.log('Message received:', discount.data);
        if (discount.data === "Welcome in the server WebSocket!") {
            console.log("Received welcome message, not a JSON, skipping parsing.");
            return;
        }
        try {
            const message = JSON.parse(discount.data);
            if (message.type === 'ADD_DISCOUNT') {
                console.log('Received add:', message.payload);
                discounts.push(message.payload);
                renderDiscountList(discounts);
            } else if (message.type === 'UPDATE_DISCOUNT') {
                console.log('Received update:', message.payload);
                const updatedDiscount = message.payload;
                const indexOfDiscountToUpdate = discounts.findIndex(discount => discount.id === updatedDiscount.id);
                if (indexOfDiscountToUpdate !== -1) {
                    discounts[indexOfDiscountToUpdate] = updatedDiscount;
                }
                renderDiscountList(discounts);
            } else if (message.type === 'REMOVE_DISCOUNT') {
                console.log('Received remove:', message.payload);
                const removedDiscount = message.payload;
                discounts = discounts.filter(discount => discount.id !== removedDiscount.id);
                renderDiscountList(discounts);
            }
        } catch (error) {
            console.error('Failed to parse message:', error);
        }
    };

    socket.onclose = function () {
        console.log('WebSocket connection closed');
    };

    async function loadDiscountsFromAPI() {
        try {
            const token = localStorage.getItem('jwtToken');
            const response = await fetch('/api/discounts', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            discounts = await response.json();
            //console.error('discounts', discounts);
            renderDiscountList(discounts);
        } catch (error) {
            console.error('Failed to load discounts from API:', error);
        }
    }

    function capitalizeFirstLetter(text) {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    }    

    // Funzione per renderizzare la lista dei discounts
    function renderDiscountList(discountList) {
        discountItems.innerHTML = '';

        discountList.forEach(discount => {
            //console.error('discount', discount);
            const discountItem = document.createElement('li');
            const formattedDate = formatDateToItalian(discount.expirationDate);
            const formattedType = capitalizeFirstLetter(discount.discountType);
            
            discountItem.innerHTML = `
                <span>${discount.name}</span>
                <span>${formattedType}</span>
                <span>${discount.rate}%</span>
                <span>${formattedDate}</span>
                <button class="edit-button" data-id="${discount.id}">Edit</button>
                <button class="remove-button" data-id="${discount.id}">Remove</button>
            `;
            discountItems.appendChild(discountItem);
        });
    }

    
    function formatDateToItalian(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('it-IT', options);
    }
    
    // Funzione per filtrare la lista degli discounti in base alla ricerca
    function filterDiscounts(query) {
        console.log('filterDiscounts IN', query, discounts);
        const normalizedQuery = query.toLowerCase().trim();
        const filteredDiscounts = discounts.filter(discount => {            
            const formattedDate = formatDateToItalian(discount.expirationDate);
            const discountDetails = `${discount.name} ${discount.type} ${formattedDate}`;
            return discountDetails.toLowerCase().includes(query.toLowerCase());
        });
        console.log('filterDiscounts OUT', filteredDiscounts);
        renderDiscountList(filteredDiscounts);
    }

    // Gestione dell'discounto di ricerca
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        filterDiscounts(query);
    });

    searchInput.addEventListener('keyup', discount => {
        if (discount.key === 'Enter') {
            const query = searchInput.value.trim();
            filterDiscounts(query);
        }
    });
    
    // Gestione dell'discounto di aggiunta discounto
    addDiscountButton.addEventListener('click', () => {
        showDiscountForm(); 
    });

    // Funzione per mostrare il form di inserimento discounto
    function showDiscountForm() {
        const discountForm = document.getElementById('discount-form');
        discountForm.classList.remove('hidden');
    }

    // Funzione per nascondere il form di inserimento discounto
    function hideDiscountForm() {
        const discountForm = document.getElementById('discount-form');
        discountForm.classList.add('hidden');
    }
    
    // Funzione per nascondere il form di modifica discounto
    function hideEditForm() {
        const discountEditForm = document.getElementById('discount-edit-form');
        discountEditForm.classList.add('hidden');
    }

    // Aggiungere un ascoltatore di discounti al pulsante di annullamento nel modulo di aggiunta di discounti
    const cancelDiscountButton = document.getElementById('cancel-discount');
    cancelDiscountButton.addEventListener('click', () => {
        hideEditForm();
    });

    // Aggiungere un ascoltatore di discounti al pulsante di annullamento nel modulo di modifica di discounti
    const cancelEditButton = document.getElementById('cancel-edit-button');
    cancelEditButton.addEventListener('click', () => {
        hideEditForm();
    });


    // Pulsante per confermare l'aggiunta dell'discounto
    const confirmAddDiscountButton = document.getElementById('confirm-discount');
    confirmAddDiscountButton.addEventListener('click', async () => {
        const discountCode = document.getElementById('discount-code').value.trim();
        const discountName = document.getElementById('discount-name').value.trim();
        const discountType = document.getElementById('discount-type').value.trim();
        const discountRate = document.getElementById('discount-rate').value.trim();
        const discountDate = document.getElementById('discount-date').value.trim();
        const discountDescription = document.getElementById('discount-description').value.trim();
        const discountLink = document.getElementById('discount-link').value.trim();

        if (discountCode && discountName && discountType && discountRate && discountDate && discountDescription && discountLink) {
            const newDiscount = {
                code: parseInt(discountCode),
                name: discountName,
                discountType: discountType,
                rate: discountRate,
                expirationDate: discountDate,
                description: discountDescription,
                link: discountLink
            };

            await addNewDiscount(newDiscount);
            
            hideDiscountForm();
            resetDiscountFormFields();

        } else {
            alert('Please enter all discount fields!');
        }
    });

    // Funzione per reimpostare i valori dei campi del form
    function resetDiscountFormFields() {
        const discountCode = document.getElementById('discount-code');
        const discountName = document.getElementById('discount-name');
        const discountType = document.getElementById('discount-type');
        const discountRate = document.getElementById('discount-rate');
        const discountDate = document.getElementById('discount-date');
        const discountDescription = document.getElementById('discount-description');
        const discountLink = document.getElementById('discount-link');

        // Reimposta i valori dei campi del form a stringa vuota
        discountCode.value = '';
        discountName.value = '';
        discountType.value = '';
        discountRate.value = '';
        discountDate.value = '';
        discountDescription.value = '';
        discountLink.value = '';
    }

    // Funzione per aggiungere un nuovo discounto alla lista
    async function addNewDiscount(discount) {
        try {
            const token = localStorage.getItem('jwtToken');
            const response = await fetch('/api/discount/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(discount)
            });

            console.log(response);
            if (!response.ok) {
                throw new Error('Failed to add discount');
            }

            const newDiscount = await response.json();
            discounts.push(newDiscount);
            renderDiscountList(discounts);
        } catch (error) {
            console.error('Error adding discount:', error);
        }
    }

    async function updateDiscount(editedDiscount) {

        try {
            const token = localStorage.getItem('jwtToken');
            const response = await fetch('/api/discount/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editedDiscount)
            });

            if (!response.ok) {
                throw new Error('Failed to update discount');
            }

            const updatedDiscount = await response.json();
            const index = discounts.findIndex(discount => discount.id === parseInt(updatedDiscount.id));
            if (index !== -1) {
                discounts[index] = updatedDiscount;
                renderDiscountList(discounts);
            }

            hideEditForm();
        } catch (error) {
            console.error('Error updating discount:', error);
        }
    }

    async function removeDiscount(discountId) {
            try {
                const token = localStorage.getItem('jwtToken');
                fetch('/api/discount/remove', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ discountId })
                }).then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to remove discount');
                    }
                    return response.json();
                }).then(removedDiscount => {
                    discounts = discounts.filter(discount => discount.id !== parseInt(removedDiscount.id));
                    renderDiscountList(discounts);
                });
            } catch (error) {
                console.error('Error removing discount:', error);
            }
    }
 
    // Inizializza la lista degli discounti
    discounts = JSON.parse(localStorage.getItem('discountList')) || [];
    renderDiscountList(discounts);

    // Funzione per popolare il form di modifica con i dettagli del discount selezionato
    function populateEditForm(discount) {
        const editCode = document.getElementById('edit-code');
        const editName = document.getElementById('edit-name');
        const editType = document.getElementById('edit-type');
        const editRate = document.getElementById('edit-rate');
        const editDate = document.getElementById('edit-date');
        const editDescription = document.getElementById('edit-description');
        const editLink = document.getElementById('edit-link');

        editCode.value = discount.code;
        editName.value = discount.name;
        editType.value = discount.discountType;
        editRate.value = discount.rate;
        editDate.value = discount.expirationDate.split('T')[0];
        editDescription.value = discount.description;
        editLink.value = discount.link;

        const saveEditButton = document.getElementById('save-edit-button');
        saveEditButton.setAttribute('data-id', discount.id);

        const discountEditForm = document.getElementById('discount-edit-form');
        discountEditForm.classList.remove('hidden');
    }

    // Gestore di discounti per il click sul pulsante "Edit"
    function handleDiscountItemClick(discount) {
        if (discount.target.classList.contains('edit-button')) {
            const discountId = discount.target.getAttribute('data-id');
            const discountToEdit = discounts.find(discount => discount.id === parseInt(discountId));
            
            if (discountToEdit) {
                console.log('discountToEdit', discountToEdit);
                populateEditForm(discountToEdit);
            }
        }
    }

    // Aggiungi un gestore di discounti alla lista degli discounti per gestire il click sugli elementi discounto
    discountItems.addEventListener('click', handleDiscountItemClick);

    const saveEditButton = document.getElementById('save-edit-button');
    saveEditButton.addEventListener('click', async () => {
        const editedDiscount = {
            eventId: saveEditButton.getAttribute('data-id'),
            code: parseInt(document.getElementById('edit-code').value.trim()),
            name: document.getElementById('edit-name').value.trim(),
            type: document.getElementById('edit-type').value.trim(),
            rate: document.getElementById('edit-rate').value.trim(),
            date: document.getElementById('edit-date').value.trim(),
            description: document.getElementById('edit-description').value.trim(),
            link: document.getElementById('edit-link').value.trim()
        };
        updateDiscount(editedDiscount);
    });
 
    // Gestore di discounti per il click sul pulsante "Remove"
    function handleRemoveButtonClick(discount) {
        if (discount.target.classList.contains('remove-button')) {
            const discountId = discount.target.getAttribute('data-id');
            removeDiscount(discountId);
        }
    }

    // Aggiungi un gestore di discounti alla lista degli discounti per gestire il click sul pulsante "Remove"
    discountItems.addEventListener('click', handleRemoveButtonClick);
    
    // Trova il pulsante "Remove All" nell'HTML
    const removeAllButton = document.getElementById('remove-all-button');

    // Aggiungi un gestore di discounti per il clic sul pulsante
    removeAllButton.addEventListener('click', () => {
        discounts.forEach(discount => {
            removeDiscount(discount.id)
        });
    });

    const addButton = document.querySelector('.add-button');
    const menuItems = document.querySelector('.menu-items');

    if (addButton && menuItems) {
        addButton.addEventListener('click', function(discount) {
            menuItems.style.display = (menuItems.style.display === 'block') ? 'none' : 'block';
            discount.stopPropagation();
        });

        document.addEventListener('click', function() {
            menuItems.style.display = 'none';
        });

        menuItems.addEventListener('click', function(discount) {
            discount.stopPropagation();
        });

        const addDiscountButton = document.getElementById('add-discount-button');

        if (addDiscountButton) {
            addDiscountButton.addEventListener('click', function(discount) {
                discount.stopPropagation();
                showDiscountForm();
            });
        }
    }

    loadDiscountsFromAPI();
    
});