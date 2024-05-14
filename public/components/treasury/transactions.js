document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const transactionItems = document.getElementById('transaction-items');
    const addTransactionButton = document.getElementById('add-transaction-button');

    // Lista degli eventi
    let transactions = [];

    // Funzione per filtrare la lista degli eventi in base alla ricerca
    function filterTransactions(query) {
        console.log('filterTransactions IN', query, transactions); // @mc console.log per debugging di esempio
        // @mc qua facevi filtro su "events", ma non l'avevi mai inizializzato
        const filteredTransactions = transactions.filter(transaction => {
            const transactionDetail = `${transaction.name} ${transaction.cash}`;
            return transactionDetail.toLowerCase().includes(query.toLowerCase()) || transaction.code.toLowerCase().includes(query.toLowerCase());
        });
        console.log('filterTransactions OUT', filteredTransactions); // @mc console.log per debugging di esempio
        renderTransactionList(filteredTransactions);
    }

    // Gestione dell'evento di ricerca
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        filterTransactions(query);
    });

    searchInput.addEventListener('keyup', transaction => {
        if (transaction.key === 'Enter') {
            const query = searchInput.value.trim();
            filterTransactions(query);
        }
    });

    // Funzione per mostrare il form di inserimento evento
    function showTransactionForm() {
        const transactionForm = document.getElementById('transaction-form');
        transactionForm.classList.remove('hidden');
    }

    // Funzione per nascondere il form di inserimento evento
    function hideTransactionForm() {
        const transactionForm = document.getElementById('transaction-form');
        transactionForm.classList.add('hidden');
    }



    // Function to hide the transaction edit form
    function hideEditForm() {
        const transactionEditForm = document.getElementById('transaction-edit-form');
        transactionEditForm.classList.add('hidden');
    }

    // Add event listener to the cancel button in the transaction add form
    const cancelTransactionButton = document.getElementById('cancel-transaction');
    cancelTransactionButton.addEventListener('click', () => {
        const transactionForm = document.getElementById('transaction-form');
        transactionForm.classList.add('hidden');
    });

    // Add event listener to the cancel button in the transaction edit form
    const cancelEditButton = document.getElementById('cancel-edit-button');
    cancelEditButton.addEventListener('click', () => {
        hideEditForm();
    });



    // Gestione dell'evento di aggiunta evento
    addTransactionButton.addEventListener('click', () => {
        showTransactionForm(); 
    });

    // Pulsante per confermare l'aggiunta dell'evento
    const confirmAddTransactionButton = document.getElementById('confirm-transaction');
    confirmAddTransactionButton.addEventListener('click', () => {
        const transactionCode = document.getElementById('transaction-code').value.trim();
        const transactionName = document.getElementById('transaction-name').value.trim();
        const transactionType = document.getElementById('transaction-type').value.trim();
        const transactionCash = document.getElementById('transaction-cash').value.trim();
        const transactionCategory = document.getElementById('transaction-category').value.trim();
        const transactionChannel = document.getElementById('transaction-channel').value.trim();        
        const transactionDate = document.getElementById('transaction-date').value.trim();
        const transactionNote = document.getElementById('transaction-note').value.trim();
        
        
    // Verifica se il codice della transazione esiste già
    const isCodeExists = transactions.some(transaction => transaction.code === transactionCode);

        if (isCodeExists) {
            const confirmation = confirm('Il codice della transazione esiste già. Vuoi reinserire i dati?');
            
            if (confirmation) {
                // L'utente ha confermato di voler reinserire i dati
                resetTransactionFormFields();
            } else {
                // L'utente ha annullato l'inserimento
                return;
            }
        } else if (transactionCode && transactionName && transactionType && transactionCash && transactionCategory && transactionChannel && transactionDate && transactionNote) {
            const newTransaction = {
                code: transactionCode,
                name: transactionName,
                type: transactionType,
                cash: transactionCash,
                category: transactionCategory,
                channel: transactionChannel,
                date: transactionDate,
                note: transactionNote
            };

            addNewTransaction(newTransaction);
            updateTotalsDisplay();            
            hideTransactionForm();
            resetTransactionFormFields();
        } else {
            alert('Per favore, inserisci tutti i campi della transazione.');
        }
    });

    // Funzione per reimpostare i valori dei campi del form
    function resetTransactionFormFields() {
        const transactionCode = document.getElementById('transaction-code');
        const transactionName = document.getElementById('transaction-name');
        const transactionType = document.getElementById('transaction-type');
        const transactionCash = document.getElementById('transaction-cash');
        const transactionCategory = document.getElementById('transaction-category');
        const transactionChannel = document.getElementById('transaction-channel');
        const transactionDate = document.getElementById('transaction-date');
        const transactionNote = document.getElementById('transaction-note');

        // Reimposta i valori dei campi del form a stringa vuota
        transactionCode.value = '';
        transactionName.value = '';
        transactionType.value = '';
        transactionCash.value = '';
        transactionCategory.value = '';
        transactionChannel.value = '';
        transactionDate.value = '';
        transactionNote.value = '';
    }

    // Funzione per aggiungere un nuovo evento alla lista
    function addNewTransaction(transaction) {
        transactions.push(transaction);
        renderTransactionList(transactions);
        updateTotalsDisplay();
        saveTransactionListToLocalStorage(transactions);
    }
    
    function saveTransactionListToLocalStorage(transactionList) {
        localStorage.setItem('transactionList', JSON.stringify(transactionList));
    }

    // Funzione per renderizzare la lista degli eventi
    function renderTransactionList(transactionList) {
        const transactionItems = document.getElementById('transaction-items');
        transactionItems.innerHTML = '';

        transactionList.forEach(transaction => {
            const transactionItem = document.createElement('li');
            transactionItem.innerHTML = `
                <span>${transaction.code}</span>
                <span>${transaction.name}</span>
                <span>${transaction.cash}€</span>
                <button class="edit-button" data-code="${transaction.code}">Edit</button>
                <button class="remove-button" data-code="${transaction.code}">Remove</button>
            `;
            transactionItems.appendChild(transactionItem);
        });
    }
    
    // Inizializza la lista degli eventi
    // @mc l'inizializzazione deve avvenire su events, se no non si valorizza mai
    transactions = JSON.parse(localStorage.getItem('transactionList')) || [];
    renderTransactionList(transactions);
    updateTotalsDisplay();
    
    
    // Funzione per popolare il form di modifica con i dettagli dello evento selezionato
    function populateEditForm(transaction) {
        const editCode = document.getElementById('edit-code');
        const editName = document.getElementById('edit-name');
        const editType = document.getElementById('edit-type');
        const editCash = document.getElementById('edit-cash');
        const editCategory = document.getElementById('edit-category');
        const editChannel = document.getElementById('edit-channel');
        const editDate = document.getElementById('edit-date');
        const editNote = document.getElementById('edit-note');
        
        editCode.value = transaction.code;    
        editName.value = transaction.name;
        editType.value = transaction.type;
        editCash.value = transaction.cash;
        editCategory.value = transaction.category;
        editChannel.value = transaction.channel;
        editDate.value = transaction.date;
        editNote.value = transaction.note;
                        
        const transactionEditForm = document.getElementById('transaction-edit-form');
        transactionEditForm.classList.remove('hidden');
    }

    // Gestore di eventi per il click sul pulsante "Edit"
    function handleTransactionItemClick(transaction) {
        if (transaction.target.classList.contains('edit-button')) {
            const code = transaction.target.getAttribute('data-code');

            const transactionToEdit = transactions.find(transaction => transaction.code === code);
            
            if (transactionToEdit) {
                populateEditForm(transactionToEdit);
            }
        }
    }


    // Aggiungi un gestore di eventi alla lista degli eventi per gestire il click sugli elementi evento
    transactionItems.addEventListener('click', handleTransactionItemClick);

    // Aggiungi un gestore di eventi per il pulsante "Salva Modifiche" nel form di modifica
    const saveEditButton = document.getElementById('save-edit-button');
    saveEditButton.addEventListener('click', () => {
        // Ottieni i dettagli modificati dallo evento nel form di modifica
        const editedCode = document.getElementById('edit-code').value.trim();
        const editedName = document.getElementById('edit-name').value.trim();
        const editedType = document.getElementById('edit-type').value.trim();
        const editedCash = document.getElementById('edit-cash').value.trim();
        const editedCategory = document.getElementById('edit-category').value.trim();
        const editedChannel = document.getElementById('edit-channel').value.trim();
        const editedDate = document.getElementById('edit-date').value.trim();
        const editedNote = document.getElementById('edit-note').value.trim();
        
        // Crea un oggetto utente con i dettagli modificati
        const editedTransaction = {
            code: editedCode,
            name: editedName,
            type: editedType,
            cash: editedCash,
            category: editedCategory,
            channel: editedChannel,
            date: editedDate,
            note: editedNote
        };

        // Sovrascrivi lo evento modificato nell'array "events"
        // @mc qui "eventIndex" era inesistente (la console ti segnalava un errore); ho usato il cardNumber come ID per identificare l'utente
        const indexOfTransactionToEdit = transactions.findIndex(x => x.code === editedTransaction.code);
        if(indexOfTransactionToEdit !== -1) transactions[indexOfTransactionToEdit] = editedTransaction;

        // Chiudi il form di modifica
        const transactionEditForm = document.getElementById('transaction-edit-form');
        transactionEditForm.classList.add('hidden');

        // Aggiorna la lista degli utenti con le modifiche
        renderTransactionList(transactions);
        updateTotalsDisplay();

        // Salva l'array aggiornato nella localStorage
        saveTransactionListToLocalStorage(transactions);
    });

    // Gestore di eventi per il click sul pulsante "Remove"
    function handleRemoveButtonClick(transaction) {
        if (transaction.target.classList.contains('remove-button')) {
            const code = event.target.getAttribute('data-code');

            // Trova l'indice dello evento da rimuovere nell'array "events"
            const indexOfTransactionToRemove = transactions.findIndex(transaction => transaction.code === code);

            if (indexOfTransactionToRemove !== -1) {
                // Rimuovi lo evento dall'array
                transactions.splice(indexOfTransactionToRemove, 1);

                // Aggiorna la lista degli eventi
                renderTransactionList(transactions);
                updateTotalsDisplay();

                // Salva l'array aggiornato nella localStorage
                saveTransactionListToLocalStorage(transactions);
            }
        }
    }

    // Aggiungi un gestore di eventi alla lista degli eventi per gestire il click sul pulsante "Remove"
    transactionItems.addEventListener('click', handleRemoveButtonClick);
    
    // Trova il pulsante "Remove All" nell'HTML
    const removeAllButton = document.getElementById('remove-all-button');

    // Aggiungi un gestore di eventi per il clic sul pulsante
    removeAllButton.addEventListener('click', () => {
        transactions = [];        
        renderTransactionList(transactions); 
        updateTotalsDisplay();       
        saveTransactionListToLocalStorage(transactions);
    });

    // Trova il pulsante "Sort by Date" nell'HTML
    const sortByDateButton = document.getElementById('sort-by-date-button');

    // Variabile per tenere traccia dello stato di ordinamento (inizio con ascendente)
    let isSortedAscending = true;

    // Aggiungi un gestore di eventi per il clic sul pulsante
    sortByDateButton.addEventListener('click', () => {
        if (isSortedAscending) {
            // Ordina gli eventi per data in ordine crescente
            transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else {
            // Ordina gli eventi per data in ordine decrescente
            transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        // Inverti lo stato di ordinamento
        isSortedAscending = !isSortedAscending;

        // Aggiorna la lista degli eventi ordinata
        renderTransactionList(transactions);
    });

    function calculateTotals() {
        let totalIn = 0;
        let totalOut = 0;
    
        transactions.forEach(transaction => {
            if (transaction.type === 'IN') {
                totalIn += parseFloat(transaction.cash);
            } else if (transaction.type === 'OUT') {
                totalOut += parseFloat(transaction.cash);
            }
        });
    
        return { totalIn, totalOut };
    }

    function updateTotalsDisplay() {
        const { totalIn, totalOut } = calculateTotals();
    
        // Aggiorna gli elementi HTML con i totali
        const totalInElement = document.getElementById('total-in');
        const totalOutElement = document.getElementById('total-out');
        const netTotalElement = document.getElementById('net-total');
    
        totalInElement.textContent = `Total In: €${totalIn.toFixed(2)}`;
        totalOutElement.textContent = `Total Out: €${totalOut.toFixed(2)}`;
    
        // Calcola il "Net Total" come differenza tra "Total In" e "Total Out"
        const netTotal = totalIn - totalOut;
        netTotalElement.textContent = `Net Total: €${netTotal.toFixed(2)}`;
    }



   
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
                showTransactionForm();
            });
        }
    }
    

    
});