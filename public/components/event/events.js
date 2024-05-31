document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const eventItems = document.getElementById('event-items');
    const addEventButton = document.getElementById('add-event-button');

    // Lista degli eventi
    let events = [];

    
    function formatDateToItalian(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('it-IT', options);
    }
    
    // Funzione per filtrare la lista degli eventi in base alla ricerca
    function filterEvents(query) {
        console.log('filterEvents IN', query, events);
        const filteredEvents = events.filter(event => {            
            const formattedDate = formatDateToItalian(event.date);
            const eventDetails = `${event.name} ${event.type} ${formattedDate}`;
            return eventDetails.toLowerCase().includes(query.toLowerCase()) || event.code.toLowerCase().includes(query.toLowerCase());
        });
        console.log('filterEvents OUT', filteredEvents);
        renderEventList(filteredEvents);
    }

    // Gestione dell'evento di ricerca
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        filterEvents(query);
    });

    searchInput.addEventListener('keyup', event => {
        if (event.key === 'Enter') {
            const query = searchInput.value.trim();
            filterEvents(query);
        }
    });

    // Funzione per mostrare il form di inserimento evento
    function showEventForm() {
        const eventForm = document.getElementById('event-form');
        eventForm.classList.remove('hidden');
    }

    // Funzione per nascondere il form di inserimento evento
    function hideEventForm() {
        const eventForm = document.getElementById('event-form');
        eventForm.classList.add('hidden');
    }
    
    // Funzione per nascondere il form di modifica evento
    function hideEditForm() {
        const eventEditForm = document.getElementById('event-edit-form');
        eventEditForm.classList.add('hidden');
    }

    // Aggiungere un ascoltatore di eventi al pulsante di annullamento nel modulo di aggiunta di eventi
    const cancelEventButton = document.getElementById('cancel-event');
    cancelEventButton.addEventListener('click', () => {
        const eventForm = document.getElementById('event-form');
        eventForm.classList.add('hidden');
    });

    // Aggiungere un ascoltatore di eventi al pulsante di annullamento nel modulo di modifica di eventi
    const cancelEditButton = document.getElementById('cancel-edit-button');
    cancelEditButton.addEventListener('click', () => {
        hideEditForm();
    });

    // Gestione dell'evento di aggiunta evento
    addEventButton.addEventListener('click', () => {
        showEventForm(); 
    });

    // Pulsante per confermare l'aggiunta dell'evento
    const confirmAddEventButton = document.getElementById('confirm-event');
    confirmAddEventButton.addEventListener('click', () => {
        const eventCode = document.getElementById('event-code').value.trim();
        const eventName = document.getElementById('event-name').value.trim();
        const eventPlace = document.getElementById('event-place').value.trim();
        const eventAddress = document.getElementById('event-address').value.trim(); 
        const eventDate = document.getElementById('event-date').value.trim(); 
        const eventTime = document.getElementById('event-time').value.trim();
        const eventDescription = document.getElementById('event-description').value.trim();
        const eventType = document.getElementById('event-type').value.trim();
        const eventPrice = document.getElementById('event-price').value.trim();
        const eventNumberParticipant = document.getElementById('event-number-participant').value.trim();

        if (eventCode && eventName && eventPlace && eventAddress && eventDate && eventTime && eventDescription && eventType && eventPrice && eventNumberParticipant) {
            const newEvent = {
                code: eventCode,
                name: eventName,
                place: eventPlace,
                address: eventAddress,
                date: eventDate,
                time: eventTime,
                description: eventDescription,
                type: eventType,
                price: eventPrice,
                numberParticipant: eventNumberParticipant
            };

            addNewEvent(newEvent);
            
            hideEventForm();
            resetEventFormFields();

        } else {
            alert('Please enter all event fields!');
        }
    });

    // Funzione per reimpostare i valori dei campi del form
    function resetEventFormFields() {
        const eventCode = document.getElementById('event-code');
        const eventName = document.getElementById('event-name');
        const eventPlace = document.getElementById('event-place');
        const eventAddress = document.getElementById('event-address');
        const eventDate = document.getElementById('event-date');
        const eventTime = document.getElementById('event-time');
        const eventDescription = document.getElementById('event-description');
        const eventType = document.getElementById('event-type');
        const eventPrice = document.getElementById('event-price');
        const eventNumberParticipant = document.getElementById('event-number-participant');

        // Reimposta i valori dei campi del form a stringa vuota
        eventCode.value = '';
        eventName.value = '';
        eventPlace.value = '';
        eventAddress.value = '';
        eventDate.value = '';
        eventTime.value = '';
        eventDescription.value = '';
        eventType.value = '';
        eventPrice.value = '';
        eventNumberParticipant.value = '';
    }

    // Funzione per aggiungere un nuovo evento alla lista
    function addNewEvent(event) {
        events.push(event);
        renderEventList(events);
        saveEventListToLocalStorage(events);
    }
    
    function saveEventListToLocalStorage(eventList) {
        localStorage.setItem('eventList', JSON.stringify(eventList));
    }

    // Funzione per renderizzare la lista degli eventi
    function renderEventList(eventList) {
        const eventItems = document.getElementById('event-items');
        eventItems.innerHTML = '';

        eventList.forEach(event => {
            const eventItem = document.createElement('li');
            const formattedDate = formatDateToItalian(event.date);
            eventItem.innerHTML = `
                <span>${event.code}</span>
                <span>${event.name}</span>
                <span>${event.type}</span>
                <span>€${event.price}</span>
                <span>${formattedDate}</span>
                <button class="edit-button" data-code="${event.code}">Edit</button>
                <button class="remove-button" data-code="${event.code}">Remove</button>
            `;
            eventItems.appendChild(eventItem);
        });
    }
    
    // Inizializza la lista degli eventi
    events = JSON.parse(localStorage.getItem('eventList')) || [];
    renderEventList(events);
    
    // Funzione per popolare il form di modifica con i dettagli dello evento selezionato
    function populateEditForm(event) {
        const editCode = document.getElementById('edit-code');
        const editName = document.getElementById('edit-name');
        const editPlace = document.getElementById('edit-place');
        const editAddress = document.getElementById('edit-address');
        const editDate = document.getElementById('edit-date');
        const editTime = document.getElementById('edit-time');
        const editDescription = document.getElementById('edit-description');
        const editType = document.getElementById('edit-type');
        const editPrice = document.getElementById('edit-price');
        const editNumberParticipant = document.getElementById('edit-number-participant');

        editCode.value = event.code;
        editName.value = event.name;
        editPlace.value = event.place;
        editAddress.value = event.address;
        editDate.value = event.date;
        editTime.value = event.time;
        editDescription.value = event.description;
        editType.value = event.type;
        editPrice.value = event.price;
        editNumberParticipant.value = event.numberParticipant;
                
        const saveEditButton = document.getElementById('save-edit-button');
        saveEditButton.setAttribute('data-code', event.code);
    
        const eventEditForm = document.getElementById('event-edit-form');
        eventEditForm.classList.remove('hidden');
    }

    // Gestore di eventi per il click sul pulsante "Edit"
    function handleEventItemClick(event) {
        if (event.target.classList.contains('edit-button')) {
            const code = event.target.getAttribute('data-code');

            const eventToEdit = events.find(event => event.code === code);
            
            if (eventToEdit) {
                populateEditForm(eventToEdit);
            }
        }
    }

    // Aggiungi un gestore di eventi alla lista degli eventi per gestire il click sugli elementi evento
    eventItems.addEventListener('click', handleEventItemClick);

    const saveEditButton = document.getElementById('save-edit-button');
    saveEditButton.addEventListener('click', () => {
        const editedEvent = {
            code: document.getElementById('edit-code').value.trim(),
            name: document.getElementById('edit-name').value.trim(),
            place: document.getElementById('edit-place').value.trim(),
            address: document.getElementById('edit-address').value.trim(),
            date: document.getElementById('edit-date').value.trim(),
            time: document.getElementById('edit-time').value.trim(),
            description: document.getElementById('edit-description').value.trim(),
            type: document.getElementById('edit-type').value,
            price: document.getElementById('edit-price').value.trim(),
            numberParticipant: document.getElementById('edit-number-participant').value.trim()
        };
    
        const index = events.findIndex(event => event.code === editedEvent.code); // Assicurati che 'code' sia un identificativo unico
        if (index !== -1) {
            events[index] = editedEvent;
            renderEventList(events);
            saveEventListToLocalStorage(events);
        } else {
            console.log('Evento non trovato');
        }
    
        hideEditForm();
    });
 
    // Gestore di eventi per il click sul pulsante "Remove"
    function handleRemoveButtonClick(event) {
        if (event.target.classList.contains('remove-button')) {
            const code = event.target.getAttribute('data-code');

            // Trova l'indice dello evento da rimuovere nell'array "events"
            const indexOfEventToRemove = events.findIndex(event => event.code === code);

            if (indexOfEventToRemove !== -1) {
                // Rimuovi lo evento dall'array
                events.splice(indexOfEventToRemove, 1);

                // Aggiorna la lista degli eventi
                renderEventList(events);

                // Salva l'array aggiornato nella localStorage
                saveEventListToLocalStorage(events);
            }
        }
    }

    // Aggiungi un gestore di eventi alla lista degli eventi per gestire il click sul pulsante "Remove"
    eventItems.addEventListener('click', handleRemoveButtonClick);
    
    // Trova il pulsante "Remove All" nell'HTML
    const removeAllButton = document.getElementById('remove-all-button');

    // Aggiungi un gestore di eventi per il clic sul pulsante
    removeAllButton.addEventListener('click', () => {
        events = [];        
        renderEventList(events);        
        saveEventListToLocalStorage(events);
    });

    // Trova il pulsante "Sort by Date" nell'HTML
    const sortByDateButton = document.getElementById('sort-by-date-button');

    // Variabile per tenere traccia dello stato di ordinamento (inizio con ascendente)
    let isSortedAscending = true;

    // Aggiungi un gestore di eventi per il clic sul pulsante
    sortByDateButton.addEventListener('click', () => {
        if (isSortedAscending) {
            // Ordina gli eventi per data in ordine crescente
            events.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else {
            // Ordina gli eventi per data in ordine decrescente
            events.sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        // Inverti lo stato di ordinamento
        isSortedAscending = !isSortedAscending;

        // Aggiorna la lista degli eventi ordinata
        renderEventList(events);
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
                showEventForm();
            });
        }
    }


    
});

