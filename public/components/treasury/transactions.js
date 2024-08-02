document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const transactionItems = document.getElementById('transaction-items');
    const addTransactionButton = document.getElementById('add-transaction-button');

    // Lista delle transazioni
    let transactions = [];



    const socket = new WebSocket('ws://192.168.1.16:3000');

    socket.onopen = function () {
        console.log('WebSocket connection established');
    };

    socket.onmessage = function (event) {
        console.log('Message received:', event.data);
        if (event.data === "Welcome in the server WebSocket!") {
            console.log("Received welcome message, not a JSON, skipping parsing.");
            return;
        }
        try {
            const message = JSON.parse(event.data);
            if (message.type === 'ADD_TRANSACTION') {
                console.log('Received add:', message.payload);
                transactions.push(message.payload);
                renderTransactionList(transactions);
                updateTotalsDisplay();
            } else if (message.type === 'UPDATE_TRANSACTION') {
                console.log('Received update:', message.payload);
                const updatedTransaction = message.payload;
                const indexOfTransactionToUpdate = transactions.findIndex(transaction => transaction.id === updatedTransaction.id);
                if (indexOfTransactionToUpdate !== -1) {
                    transactions[indexOfTransactionToUpdate] = updatedTransaction;
                }
                renderTransactionList(transactions);
                updateTotalsDisplay();
            } else if (message.type === 'REMOVE_TRANSACTION') {
                console.log('Received remove:', message.payload);
                const removedTransaction = message.payload;
                transactions = transactions.filter(transaction => transaction.id !== removedTransaction.id);
                renderTransactionList(transactions);
                updateTotalsDisplay();
            }
        } catch (error) {
            console.error('Error parsing WebSocket message:', error);
        }
    };

    socket.onclose = function () {
        console.log('WebSocket connection closed');
    };

    async function loadTransactionsFromAPI() {
        try {
            const token = localStorage.getItem('jwt');
            const response = await fetch('/api/transactions', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            transactions = await response.json();
            renderTransactionList(transactions);
            updateTotalsDisplay();
        } catch (error) {
            console.error('Failed to load transactions from API:', error);
        }
    }

    // Funzione per renderizzare la lista delle transazioni
    function renderTransactionList(transactionList) {
        const transactionItems = document.getElementById('transaction-items');
        transactionItems.innerHTML = '';

        transactionList.forEach(transaction => {
            const transactionItem = document.createElement('li');
            transactionItem.innerHTML = `
                <span>${transaction.code}</span>
                <span>${transaction.name}</span>
                <span>${transaction.type}</span>
                <span>${transaction.cash}€</span>
                <span>${transaction.date}</span>
                <button class="edit-button" data-code="${transaction.code}">Edit</button>
                <button class="remove-button" data-code="${transaction.code}">Remove</button>
            `;
            transactionItems.appendChild(transactionItem);
        });
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

    // Funzione per filtrare la lista delle transazioni in base alla ricerca
    function filterTransactions(query) {
        console.log('filterTransactions IN', query, transactions);
        const filteredTransactions = transactions.filter(transaction => {
            const transactionDetail = `${transaction.name} ${transaction.cash}`;
            return transactionDetail.toLowerCase().includes(query.toLowerCase()) || transaction.code.toLowerCase().includes(query.toLowerCase());
        });
        console.log('filterTransactions OUT', filteredTransactions);
        renderTransactionList(filteredTransactions);
    }

    // Gestione dell'evento di aggiunta transazione
    addTransactionButton.addEventListener('click', () => {
        showTransactionForm(); 
    });

    // Funzione per mostrare il form di inserimento transazione
    function showTransactionForm() {
        const transactionForm = document.getElementById('transaction-form');
        transactionForm.classList.remove('hidden');
    }

    // Funzione per nascondere il form di inserimento transazione
    function hideTransactionForm() {
        const transactionForm = document.getElementById('transaction-form');
        transactionForm.classList.add('hidden');
    }

    // Funzione per nascondere il form di modifica transazione
    function hideEditForm() {
        const transactionEditForm = document.getElementById('transaction-edit-form');
        transactionEditForm.classList.add('hidden');
    }

    // Aggiungi ascoltatore di eventi al pulsante di annullamento nel modulo di aggiunta della transazione
    const cancelTransactionButton = document.getElementById('cancel-transaction');
    cancelTransactionButton.addEventListener('click', () => {
        hideTransactionForm();
    });

    // Aggiungi ascoltatore di eventi al pulsante di annullamento nel modulo di modifica della transazione
    const cancelEditButton = document.getElementById('cancel-edit-button');
    cancelEditButton.addEventListener('click', () => {
        hideEditForm();
    });  

    // Pulsante per confermare l'aggiunta della transazione
    const confirmAddTransactionButton = document.getElementById('confirm-transaction');
    confirmAddTransactionButton.addEventListener('click', async () => {
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
            const confirmation = confirm('The transaction code already exists. Do you want to re-enter the data?');
            
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

            await addNewTransaction(newTransaction);
                   
            hideTransactionForm();
            resetTransactionFormFields();
        } else {
            alert('Please enter all transaction fields.');
        }
    });

    async function addNewTransaction(transaction) {
        try {
            const token = localStorage.getItem('jwt');
            const response = await fetch('/api/transaction/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(transaction)
            });

            if (!response.ok) {
                throw new Error('Failed to add transaction');
            }

            const newTransaction = await response.json();
            transactions.push(newTransaction);
            renderTransactionList(transactions);
            updateTotalsDisplay();
        } catch (error) {
            console.error('Error adding transaction:', error);
        }
    }

    // Funzione per popolare il form di modifica con i dettagli della transazione selezionata
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
        editType.value = transaction.transactionType;
        editCash.value = transaction.amount;
        editCategory.value = transaction.category;
        editChannel.value = transaction.channel;
        editDate.value = transaction.date;
        editNote.value = transaction.note;

        const saveEditButton = document.getElementById('save-edit-button');
        saveEditButton.setAttribute('data-id', transaction.id);

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

    transactionItems.addEventListener('click', handleTransactionItemClick);

    const saveEditButton = document.getElementById('save-edit-button');
    saveEditButton.addEventListener('click', async () => {
        const editedTransaction = {
            id: saveEditButton.getAttribute('data-id'),
            code: document.getElementById('edit-code').value.trim(),
            name: document.getElementById('edit-name').value.trim(),
            type: document.getElementById('edit-type').value.trim(),
            amount: document.getElementById('edit-cash').value.trim(),
            category: document.getElementById('edit-category').value.trim(),
            channel: document.getElementById('edit-channel').value.trim(),
            date: document.getElementById('edit-date').value.trim(),
            note: document.getElementById('edit-note').value.trim()
        };

        await updateTransaction(editedTransaction);
    });

    async function updateTransaction(transaction) {
        try {
            const token = localStorage.getItem('jwt');
            const response = await fetch('/api/transaction/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(transaction)
            });

            if (!response.ok) {
                throw new Error('Failed to update transaction');
            }

            const updatedTransaction = await response.json();
            const index = transactions.findIndex(tr => tr.id === parseInt(updatedTransaction.id));
            if (index !== -1) {
                transactions[index] = updatedTransaction;
                renderTransactionList(transactions);
                updateTotalsDisplay();
            }

            hideEditForm();
        } catch (error) {
            console.error('Error updating transaction:', error);
        }
    }

    function handleRemoveButtonClick(event) {
        if (event.target.classList.contains('remove-button')) {
            const transactionId = event.target.getAttribute('data-id');

            try {
                const token = localStorage.getItem('jwt');
                fetch('/api/transaction/remove', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ transactionId })
                }).then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to remove transaction');
                    }
                    return response.json();
                }).then(removedTransaction => {
                    transactions = transactions.filter(transaction => transaction.id !== parseInt(removedTransaction.id));
                    renderTransactionList(transactions);
                    updateTotalsDisplay();
                });
            } catch (error) {
                console.error('Error removing transaction:', error);
            }
        }
    }



















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






    // Funzione per aggiungere una nuova transazione alla lista
    function addNewTransaction(transaction) {
        transactions.push(transaction);
        renderTransactionList(transactions);
        updateTotalsDisplay();
        saveTransactionListToLocalStorage(transactions);
    }
    
    function saveTransactionListToLocalStorage(transactionList) {
        localStorage.setItem('transactionList', JSON.stringify(transactionList));
    }

    
    
    // Inizializza la lista delle transazioni
    transactions = JSON.parse(localStorage.getItem('transactionList')) || [];
    renderTransactionList(transactions);
    updateTotalsDisplay();
   

    // Aggiungi un gestore di eventi alla lista delle transazioni per gestire il click sugli elementi transazione
    transactionItems.addEventListener('click', handleTransactionItemClick);

    
    // Gestore di eventi per il click sul pulsante "Remove"
    function handleRemoveButtonClick(transaction) {
        if (transaction.target.classList.contains('remove-button')) {
            const code = event.target.getAttribute('data-code');

            // Trova l'indice dello transazione da rimuovere nell'array "transactions"
            const indexOfTransactionToRemove = transactions.findIndex(transaction => transaction.code === code);

            if (indexOfTransactionToRemove !== -1) {
                // Rimuovi lo transazione dall'array
                transactions.splice(indexOfTransactionToRemove, 1);

                // Aggiorna la lista delle transazioni
                renderTransactionList(transactions);
                updateTotalsDisplay();

                // Salva l'array aggiornato nella localStorage
                saveTransactionListToLocalStorage(transactions);
            }
        }
    }

    // Aggiungi un gestore di eventi alla lista delle transazioni per gestire il click sul pulsante "Remove"
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
            // Ordina le transazioni per data in ordine crescente
            transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else {
            // Ordina le transazioni per data in ordine decrescente
            transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        // Inverti lo stato di ordinamento
        isSortedAscending = !isSortedAscending;

        // Aggiorna la lista 
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