document.addEventListener('DOMContentLoaded', async function () {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const eventItems = document.getElementById('event-items');
    const addEventButton = document.getElementById('add-event-button');

    let events = [];

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
            if (message.type === 'ADD_EVENT') {
                //console.log('Received add:', message.payload);
                const existingEvent = events.find(e => e.id === message.payload.id);
                if (!existingEvent) {
                    events.push(message.payload);
                    renderEventList(events);
                }
            } else if (message.type === 'UPDATE_EVENT') {
                //console.log('Received update:', message.payload);
                const updatedEvent = message.payload;
                const indexOfEventToUpdate = events.findIndex(event => event.id === updatedEvent.id);
                if (indexOfEventToUpdate !== -1) {
                    events[indexOfEventToUpdate] = updatedEvent;
                }
                renderEventList(events);
            } else if (message.type === 'REMOVE_EVENT') {
                //console.log('Received remove:', message.payload);
                const removedEvent = message.payload;
                events = events.filter(event => event.id !== removedEvent.id);
                renderEventList(events);
            }
        } catch (error) {
            console.error('Failed to parse message:', error);
        }
    };

    socket.onclose = function () {
        //console.log('WebSocket connection closed');
    };

    async function loadEventsFromAPI() {
        try {
            const token = localStorage.getItem('jwtToken');
            const response = await fetch(`/api/events`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            events = await response.json();
            renderEventList(events);
        } catch (error) {
            console.error('Failed to load events from API:', error);
        }
    }

    function renderEventList(eventList) {
        if (eventList.length === 0) {
            eventItems.innerHTML = "<p>No events found.</p>";
        } else {
            eventItems.innerHTML = '';

            eventList.forEach(event => {
                
                const formattedDate = formatDateToItalian(event.date);
                const formattedEventType = event.eventType
                .toLowerCase()
                .replace(/_/g, ' ')
                .replace(/\b\w/g, char => char.toUpperCase());
                const eventItem = document.createElement('li');
                eventItem.innerHTML = `
                    <span>${event.name}</span>
                    <span>${formattedEventType}</span>
                    <span>€${event.price}</span>
                    <span>${formattedDate}</span>
                    <button class="edit-button" data-id="${event.id}">Edit</button>
                    <button class="remove-button" data-id="${event.id}">Remove</button>
                `;
                eventItems.appendChild(eventItem);
            });
        }
    }

    
    function formatDateToItalian(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('it-IT', options);
    }
    
    function filterEvents(query) {
        //console.log('filterEvents IN', query, events);
        const filteredEvents = events.filter(event => {            
            const formattedDate = formatDateToItalian(event.date);
            const eventDetails = `${event.name} ${event.type} ${formattedDate}`;
            return eventDetails.toLowerCase().includes(query.toLowerCase());
        });
        //console.log('filterEvents OUT', filteredEvents);
        renderEventList(filteredEvents);
    }

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
    
    addEventButton.addEventListener('click', () => {
        showEventForm(); 
    });

    function showEventForm() {
        const eventForm = document.getElementById('event-form');
        eventForm.classList.remove('hidden');
    }

    function hideEventForm() {
        const eventForm = document.getElementById('event-form');
        eventForm.classList.add('hidden');
    }
    
    function hideEditForm() {
        const eventEditForm = document.getElementById('event-edit-form');
        eventEditForm.classList.add('hidden');
    }

    const cancelEventButton = document.getElementById('cancel-event');
    cancelEventButton.addEventListener('click', () => {
        hideEventForm();
    });

    const cancelEditButton = document.getElementById('cancel-edit-button');
    cancelEditButton.addEventListener('click', () => {
        hideEditForm();
    });

    const confirmAddEventButton = document.getElementById('confirm-event');
    confirmAddEventButton.addEventListener('click', async () => {
        const eventName = document.getElementById('event-name').value.trim();
        const eventPlace = document.getElementById('event-place').value.trim();
        const eventAddress = document.getElementById('event-address').value.trim(); 
        const eventDate = document.getElementById('event-date').value.trim(); 
        const eventTime = document.getElementById('event-time').value.trim();
        const eventDescription = document.getElementById('event-description').value.trim();
        const eventType = document.getElementById('event-type').value.trim();
        const eventPrice = document.getElementById('event-price').value.trim();
        const eventNumberParticipant = document.getElementById('event-number-participant').value.trim();

        if (eventName && eventPlace && eventAddress && eventDate && eventTime && eventDescription && eventType && eventPrice && eventNumberParticipant) {
            const newEvent = {
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

            await addNewEvent(newEvent);
            
            hideEventForm();
            resetEventFormFields();

        } else {
            alert('Please enter all event fields!');
        }
    });

    function resetEventFormFields() {
        const eventName = document.getElementById('event-name');
        const eventPlace = document.getElementById('event-place');
        const eventAddress = document.getElementById('event-address');
        const eventDate = document.getElementById('event-date');
        const eventTime = document.getElementById('event-time');
        const eventDescription = document.getElementById('event-description');
        const eventType = document.getElementById('event-type');
        const eventPrice = document.getElementById('event-price');
        const eventNumberParticipant = document.getElementById('event-number-participant');

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

    async function addNewEvent(event) {
        try {
            const token = localStorage.getItem('jwtToken');
            const response = await fetch('/api/event/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(event)
            });

            //console.log(response);
            if (!response.ok) {
                throw new Error('Failed to add event');
            }

            //console.log("Event added successfully, waiting for WebSocket update.");
        } catch (error) {
            console.error('Error adding event:', error);
        }
    }

    async function updateEvent(editedEvent) {
        try {
            const token = localStorage.getItem('jwtToken');
            const response = await fetch('/api/event/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editedEvent)
            });

            if (!response.ok) {
                throw new Error('Failed to update event: ${response.status}');
            }

            const updatedEvent = await response.json();
            const index = events.findIndex(event => event.id === parseInt(updatedEvent.id));
            if (index !== -1) {
                events[index] = updatedEvent;
                renderEventList(events);
            }

            //console.log("Event updated successfully:", updatedEvent);
            alert("Event updated successfully!");

            hideEditForm();
        } catch (error) {
            console.error('Error updating event:', error);
        }
    }

    async function removeEvent(eventId) {
        try {
            const token = localStorage.getItem('jwtToken');
            fetch('/api/event/remove', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ eventId })
            }).then(response => {
                if (!response.ok) {
                    throw new Error('Failed to remove event: ${response.status}');
                }
                return response.json();
            }).then(removedEvent => {
                events = events.filter(event => event.id !== parseInt(removedEvent.id));
                renderEventList(events);
            });
        } catch (error) {
            console.error('Error removing event:', error);
        }
    }
    
    events = JSON.parse(localStorage.getItem('eventList')) || [];
    renderEventList(events);
  
    function populateEditForm(event) {
        const editName = document.getElementById('edit-name');
        const editPlace = document.getElementById('edit-place');
        const editAddress = document.getElementById('edit-address');
        const editDate = document.getElementById('edit-date');
        const editTime = document.getElementById('edit-time');
        const editDescription = document.getElementById('edit-description');
        const editType = document.getElementById('edit-type');
        const editPrice = document.getElementById('edit-price');
        const editNumberParticipant = document.getElementById('edit-number-participant');

        editName.value = event.name;
        editPlace.value = event.place;
        editAddress.value = event.address;
        editDate.value = event.date.split('T')[0];
        editTime.value = event.time;
        editDescription.value = event.description;
        editType.value = event.eventType;
        editPrice.value = event.price;
        editNumberParticipant.value = event.participants;
                
        const saveEditButton = document.getElementById('save-edit-button');
        saveEditButton.setAttribute('data-id', event.id);
    
        const eventEditForm = document.getElementById('event-edit-form');
        eventEditForm.classList.remove('hidden');
    }

    function handleEventItemClick(event) {
        if (event.target.classList.contains('edit-button')) {
            let eventId = event.target.getAttribute('data-id'); 
            const eventToEdit = events.find(event => event.id === parseInt(eventId));
            
            if (eventToEdit) {
                populateEditForm(eventToEdit);
            }
        }
    }

    eventItems.addEventListener('click', handleEventItemClick);

    const saveEditButton = document.getElementById('save-edit-button');
    saveEditButton.addEventListener('click', async () => {
        const editedEvent = {
            eventId: saveEditButton.getAttribute('data-id'),
            name: document.getElementById('edit-name').value.trim(),
            place: document.getElementById('edit-place').value.trim(),
            address: document.getElementById('edit-address').value.trim(),
            date: document.getElementById('edit-date').value.trim(),
            time: document.getElementById('edit-time').value.trim(),
            description: document.getElementById('edit-description').value.trim(),
            eventType: document.getElementById('edit-type').value, 
            price: parseFloat(document.getElementById('edit-price').value.trim()), 
            participants: parseInt(document.getElementById('edit-number-participant').value.trim())
        };
        updateEvent(editedEvent);
    });
 
    function handleRemoveButtonClick(event) {
        if (event.target.classList.contains('remove-button')) {
            const eventId = event.target.getAttribute('data-id');
            removeEvent(eventId);
        }
    }

    eventItems.addEventListener('click', handleRemoveButtonClick);
    
    const removeAllButton = document.getElementById('remove-all-button');

    removeAllButton.addEventListener('click', () => {
        events.forEach(event => {
            removeEvent(event.id);
        });
    });

    const sortByDateButton = document.getElementById('sort-by-date-button');

    let isSortedAscending = true;

    sortByDateButton.addEventListener('click', () => {
        if (isSortedAscending) {
            events.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else {
            events.sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        isSortedAscending = !isSortedAscending;

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

    loadEventsFromAPI();
    
});

