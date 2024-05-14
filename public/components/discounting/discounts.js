document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const discountItems = document.getElementById('discount-items');
    const addDiscountButton = document.getElementById('add-discount-button');

    // Lista degli eventi
    let discounts = [];

    // Funzione per filtrare la lista degli eventi in base alla ricerca
    function filterDiscounts(query) {
        console.log('filterDiscounts IN', query, discounts); // @mc console.log per debugging di esempio
        // @mc qua facevi filtro su "events", ma non l'avevi mai inizializzato
        const filteredDiscounts = discounts.filter(discount => {
            const discountDetail = `${discount.name} ${discount.type}`;
            return discountDetail.toLowerCase().includes(query.toLowerCase()) || discount.code.toLowerCase().includes(query.toLowerCase());
        });
        console.log('filterDiscounts OUT', filteredDiscounts); // @mc console.log per debugging di esempio
        renderDiscountList(filteredDiscounts);
    }

    // Gestione dell'evento di ricerca
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

    // Funzione per mostrare il form di inserimento evento
    function showDiscountForm() {
        const discountForm = document.getElementById('discount-form');
        discountForm.classList.remove('hidden');
    }

    // Funzione per nascondere il form di inserimento evento
    function hideDiscountForm() {
        const discountForm = document.getElementById('discount-form');
        discountForm.classList.add('hidden');
    }


    
    // Function to hide the discount edit form
    function hideEditForm() {
        const discountEditForm = document.getElementById('discount-edit-form');
        discountEditForm.classList.add('hidden');
    }

    // Add event listener to the cancel button in the discount add form
    const cancelDiscountButton = document.getElementById('cancel-discount');
    cancelDiscountButton.addEventListener('click', () => {
        const discountForm = document.getElementById('discount-form');
        discountForm.classList.add('hidden');
    });

    // Add event listener to the cancel button in the discount edit form
    const cancelEditButton = document.getElementById('cancel-edit-button');
    cancelEditButton.addEventListener('click', () => {
        hideEditForm();
    });



    // Gestione dell'evento di aggiunta evento
    addDiscountButton.addEventListener('click', () => {
        showDiscountForm(); 
    });

    // Pulsante per confermare l'aggiunta dell'evento
    const confirmAddDiscountButton = document.getElementById('confirm-discount');
    confirmAddDiscountButton.addEventListener('click', () => {
        const discountCode = document.getElementById('discount-code').value.trim();
        const discountName = document.getElementById('discount-name').value.trim();
        const discountType = document.getElementById('discount-type').value.trim();
        const discountRate = document.getElementById('discount-rate').value.trim();
        const discountDate = document.getElementById('discount-date').value.trim();
        const discountDescription = document.getElementById('discount-description').value.trim();
        const discountLink = document.getElementById('discount-link').value.trim();
        
        if (discountCode && discountName && discountType && discountRate && discountDate && discountDescription && discountLink) {
            const newDiscount = {
                code: discountCode,
                name: discountName,
                type: discountType,
                rate: discountRate,
                date: discountDate,
                description: discountDescription,
                link: discountLink
            };

            addNewDiscount(newDiscount);
            
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

    // Funzione per aggiungere un nuovo evento alla lista
    function addNewDiscount(discount) {
        discounts.push(discount);
        renderDiscountList(discounts);
        saveDiscountListToLocalStorage(discounts);
    }
    
    function saveDiscountListToLocalStorage(discountList) {
        localStorage.setItem('discountList', JSON.stringify(discountList));
    }

    // Funzione per renderizzare la lista degli eventi
    function renderDiscountList(discountList) {
        const discountItems = document.getElementById('discount-items');
        discountItems.innerHTML = '';

        discountList.forEach(discount => {
            const discountItem = document.createElement('li');
            discountItem.innerHTML = `
                <span>${discount.code}</span>
                <span>${discount.name}</span>
                <span>${discount.type}</span>
                <span>${discount.rate}%</span>
                <button class="edit-button" data-code="${discount.code}">Edit</button>
                <button class="remove-button" data-code="${discount.code}">Remove</button>
            `;
            discountItems.appendChild(discountItem);
        });
    }
    
    // Inizializza la lista degli eventi
    // @mc l'inizializzazione deve avvenire su events, se no non si valorizza mai
    discounts = JSON.parse(localStorage.getItem('discountList')) || [];
    renderDiscountList(discounts);

    
    
    // Funzione per popolare il form di modifica con i dettagli dello evento selezionato
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
        editType.value = discount.type;
        editRate.value = discount.rate;
        editDate.value = discount.date;
        editDescription.value = discount.description;
        editLink.value = discount.link;
                        
        const discountEditForm = document.getElementById('discount-edit-form');
        discountEditForm.classList.remove('hidden');
    }

    // Gestore di eventi per il click sul pulsante "Edit"
    function handleDiscountItemClick(discount) {
        if (discount.target.classList.contains('edit-button')) {
            const code = discount.target.getAttribute('data-code');

            const discountToEdit = discounts.find(discount => discount.code === code);
            
            if (discountToEdit) {
                populateEditForm(discountToEdit);
            }
        }
    }


    // Aggiungi un gestore di eventi alla lista degli eventi per gestire il click sugli elementi evento
    discountItems.addEventListener('click', handleDiscountItemClick);

    // Aggiungi un gestore di eventi per il pulsante "Salva Modifiche" nel form di modifica
    const saveEditButton = document.getElementById('save-edit-button');
    saveEditButton.addEventListener('click', () => {
        // Ottieni i dettagli modificati dallo evento nel form di modifica
        const editedCode = document.getElementById('edit-code').value.trim();
        const editedName = document.getElementById('edit-name').value.trim();
        const editedType = document.getElementById('edit-type').value.trim();
        const editedRate = document.getElementById('edit-rate').value.trim();
        const editedDate = document.getElementById('edit-date').value.trim();
        const editedDescription = document.getElementById('edit-description').value.trim();
        const editedLink = document.getElementById('edit-link').value.trim();

        // Crea un oggetto utente con i dettagli modificati
        const editedDiscount = {
            code: editedCode,
            name: editedName,
            type: editedType,
            rate: editedRate,
            date: editedDate,
            description: editedDescription,
            link: editedLink
        };

        // Sovrascrivi lo evento modificato nell'array "events"
        // @mc qui "eventIndex" era inesistente (la console ti segnalava un errore); ho usato il cardNumber come ID per identificare l'utente
        const indexOfDiscountToEdit = discounts.findIndex(x => x.code === editedDiscount.name);
        if(indexOfDiscountToEdit !== -1) discounts[indexOfDiscountToEdit] = editedDiscount;

        // Chiudi il form di modifica
        const discountEditForm = document.getElementById('discount-edit-form');
        discountEditForm.classList.add('hidden');

        // Aggiorna la lista degli utenti con le modifiche
        renderDiscountList(discounts);

        // Salva l'array aggiornato nella localStorage
        saveDiscountListToLocalStorage(discounts);
    });

    // Gestore di eventi per il click sul pulsante "Remove"
    function handleRemoveButtonClick(discount) {
        if (event.target.classList.contains('remove-button')) {
            const code = event.target.getAttribute('data-code');

            // Trova l'indice dello evento da rimuovere nell'array "events"
            const indexOfDiscountToRemove = discounts.findIndex(discount => discount.code === code);

            if (indexOfDiscountToRemove !== -1) {
                // Rimuovi lo evento dall'array
                discounts.splice(indexOfDiscountToRemove, 1);

                // Aggiorna la lista degli eventi
                renderDiscountList(discounts);

                // Salva l'array aggiornato nella localStorage
                saveDiscountListToLocalStorage(discounts);
            }
        }
    }

    // Aggiungi un gestore di eventi alla lista degli eventi per gestire il click sul pulsante "Remove"
    discountItems.addEventListener('click', handleRemoveButtonClick);
    
    // Trova il pulsante "Remove All" nell'HTML
    const removeAllButton = document.getElementById('remove-all-button');

    // Aggiungi un gestore di eventi per il clic sul pulsante
    removeAllButton.addEventListener('click', () => {
        discounts = [];        
        renderDiscountList(discounts);        
        saveDiscountListToLocalStorage(discounts);
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

        const addEventButton = document.getElementById('add-event-button');

        if (addEventButton) {
            addEventButton.addEventListener('click', function(event) {
                event.stopPropagation();
                showDiscountForm();
            });
        }
    }
    

    
});

