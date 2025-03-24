document.addEventListener('DOMContentLoaded', async function () {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const transactionItems = document.getElementById('transaction-items');
    const addTransactionButton = document.getElementById('add-transaction-button');

    let transactions = [];

    const socket = new WebSocket(window.config.webSocketUrl);
    //console.log("WebSocket initialized:", window.config.webSocketUrl);

    socket.onopen = function () {
        //console.log('WebSocket connection established');
    };

    socket.onmessage = function (event) {
        //console.log('Message received:', event.data);
        if (event.data === "Welcome in the server WebSocket!") {
            return;
        }
        try {
            const message = JSON.parse(event.data);
            if (message.type === 'ADD_TRANSACTION') {
                if (!transactions.find(transaction => transaction.id === message.payload.id)) {
                    transactions.push(message.payload);
                    renderTransactionList(transactions);
                    updateTotalsDisplay();
                }
            } else if (message.type === 'UPDATE_TRANSACTION') {
                const updatedTransaction = message.payload;
                const indexOfTransactionToUpdate = transactions.findIndex(transaction => transaction.id === updatedTransaction.id);
                if (indexOfTransactionToUpdate !== -1) {
                    transactions[indexOfTransactionToUpdate] = updatedTransaction;
                }
                renderTransactionList(transactions);
                updateTotalsDisplay();
            } else if (message.type === 'REMOVE_TRANSACTION') {
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
        //console.log('WebSocket connection closed');
    };

    async function loadTransactionsFromAPI() {
        try {
            const token = localStorage.getItem('jwtToken');
            const response = await fetch(`/api/transactions`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            transactions = await response.json();
            renderTransactionList(transactions);
        } catch (error) {
            console.error('Failed to load transactions from API:', error);
        }
    }

    function formatDateToItalian(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('it-IT', options);
    }

    function renderTransactionList(transactionList) {
        if (transactionList.length === 0) {
            transactionItems.innerHTML = "<p>No transactions found.</p>";
        } else {
            const transactionItems = document.getElementById('transaction-items');
            transactionItems.innerHTML = '';

            transactionList.forEach(transaction => {
                const transactionItem = document.createElement('li');
                const formattedDate = formatDateToItalian(transaction.date);
                transactionItem.innerHTML = `
                    <span>${transaction.id}</span>
                    <span>${transaction.name}</span>
                    <span>${transaction.transactionType}</span>
                    <span>${transaction.amount}€</span>
                    <span>${formattedDate}</span>
                    <button class="edit-button" data-id="${transaction.id}">Edit</button>
                    <button class="remove-button" data-id="${transaction.id}">Remove</button>
                `;
                transactionItems.appendChild(transactionItem);
                updateTotalsDisplay();
            });
        }
    }

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

    function filterTransactions(query) {
        const filteredTransactions = transactions.filter(transaction => {
            const transactionDetail = `${transaction.name} ${transaction.amount}`;
            return transactionDetail.toLowerCase().includes(query.toLowerCase());
        });
        renderTransactionList(filteredTransactions);
    }

    addTransactionButton.addEventListener('click', () => {
        showTransactionForm(); 
    });

    function showTransactionForm() {
        const transactionForm = document.getElementById('transaction-form');
        transactionForm.classList.remove('hidden');
    }

    function hideTransactionForm() {
        const transactionForm = document.getElementById('transaction-form');
        transactionForm.classList.add('hidden');
    }

    function hideEditForm() {
        const transactionEditForm = document.getElementById('transaction-edit-form');
        transactionEditForm.classList.add('hidden');
    }

    const cancelTransactionButton = document.getElementById('cancel-transaction');
    cancelTransactionButton.addEventListener('click', () => {
        hideTransactionForm();
    });

    const cancelEditButton = document.getElementById('cancel-edit-button');
    cancelEditButton.addEventListener('click', () => {
        hideEditForm();
    });  

    const confirmAddTransactionButton = document.getElementById('confirm-transaction');
    confirmAddTransactionButton.addEventListener('click', async () => {
        const transactionName = document.getElementById('transaction-name').value.trim();
        const transactionType = document.getElementById('transaction-type').value.trim();
        const transactionCash = document.getElementById('transaction-cash').value.trim();
        const transactionCategory = document.getElementById('transaction-category').value.trim();
        const transactionChannel = document.getElementById('transaction-channel').value.trim();        
        const transactionDate = document.getElementById('transaction-date').value.trim();
        const transactionNote = document.getElementById('transaction-note').value.trim();        
        

        if (transactionName && transactionType && transactionCash && transactionCategory && transactionChannel && transactionDate && transactionNote) {
            const newTransaction = {
                id: transactions.length + 1,
                name: transactionName,
                transactionType: transactionType,
                amount: transactionCash,
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
            const token = localStorage.getItem('jwtToken');
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
            if (!transactions.find(t => t.id === newTransaction.id)) {
                transactions.push(newTransaction);
            }
            renderTransactionList(transactions);
            updateTotalsDisplay();
        } catch (error) {
            console.error('Error adding transaction:', error);
        }
    }

    function populateEditForm(transaction) {
        const editName = document.getElementById('edit-name');
        const editType = document.getElementById('edit-type');
        const editCash = document.getElementById('edit-cash');
        const editCategory = document.getElementById('edit-category');
        const editChannel = document.getElementById('edit-channel');
        const editDate = document.getElementById('edit-date');
        const editNote = document.getElementById('edit-note');

        editName.value = transaction.name;
        editType.value = transaction.transactionType;
        editCash.value = transaction.amount;
        editCategory.value = transaction.category;
        editChannel.value = transaction.channel;
        editDate.value = transaction.date.split('T')[0];
        editNote.value = transaction.note;

        const saveEditButton = document.getElementById('save-edit-button');
        saveEditButton.setAttribute('data-id', transaction.id);

        const transactionEditForm = document.getElementById('transaction-edit-form');
        transactionEditForm.classList.remove('hidden');
    }

    function handleTransactionItemClick(event) {
        if (event.target.classList.contains('edit-button')) {
            const id = event.target.getAttribute('data-id');  
            const transactionToEdit = transactions.find(transaction => transaction.id === parseInt(id)); 
            
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
            name: document.getElementById('edit-name').value.trim(),
            transactionType: document.getElementById('edit-type').value.trim(), 
            amount: parseFloat(document.getElementById('edit-cash').value.trim()), 
            category: document.getElementById('edit-category').value.trim(),
            channel: document.getElementById('edit-channel').value.trim(),
            date: new Date(document.getElementById('edit-date').value.trim()), 
            note: document.getElementById('edit-note').value.trim()
        };        

        await updateTransaction(editedTransaction);
    });

    async function updateTransaction(transaction) {
        try {

            const token = localStorage.getItem('jwtToken');
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

    function removeTransaction(id) {
        try {
               const token = localStorage.getItem('jwtToken');
               fetch('/api/transaction/remove', {
                   method: 'POST',
                   headers: {
                       'Content-Type': 'application/json',
                       'Authorization': `Bearer ${token}`
                   },
                   body: JSON.stringify({ "transactionId":id })
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

   function handleRemoveButtonClick(event) {
        if (event.target.classList.contains('remove-button')) {
            const id = event.target.getAttribute('data-id');

            removeTransaction(id);
        }
    }

    function resetTransactionFormFields() {
        const transactionName = document.getElementById('transaction-name');
        const transactionType = document.getElementById('transaction-type');
        const transactionCash = document.getElementById('transaction-cash');
        const transactionCategory = document.getElementById('transaction-category');
        const transactionChannel = document.getElementById('transaction-channel');
        const transactionDate = document.getElementById('transaction-date');
        const transactionNote = document.getElementById('transaction-note');

        transactionName.value = '';
        transactionType.value = '';
        transactionCash.value = '';
        transactionCategory.value = '';
        transactionChannel.value = '';
        transactionDate.value = '';
        transactionNote.value = '';
    }

    transactionItems.addEventListener('click', handleTransactionItemClick);

    function hsandleRemoveButtonClick(event) {
        if (event.target.classList.contains('remove-button')) {
            const id = event.target.getAttribute('data-id'); 
            const indexOfTransactionToRemove = transactions.findIndex(transaction => transaction.id === parseInt(id));
            
            if (indexOfTransactionToRemove !== -1) {
                transactions.splice(indexOfTransactionToRemove, 1);
    
                renderTransactionList(transactions);
                updateTotalsDisplay();
            }
        }
    }

    transactionItems.addEventListener('click', handleRemoveButtonClick);
    
    const removeAllButton = document.getElementById('remove-all-button');

    removeAllButton.addEventListener('click', () => {
        transactions.forEach(transaction => {
            removeTransaction(transaction.id);
        });
    });

    const sortByDateButton = document.getElementById('sort-by-date-button');
    
    let isSortedAscending = true;

    sortByDateButton.addEventListener('click', () => {
        if (isSortedAscending) {
            transactions.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else {
            transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        isSortedAscending = !isSortedAscending;

        renderTransactionList(transactions);
    });

    function calculateTotals() {
        let totalIn = 0;
        let totalOut = 0;
    
        transactions.forEach(transaction => {
            type = transaction.transactionType;
            amount = parseFloat(transaction.amount);
            if (type === 'IN') {
                totalIn += amount;
            } else if (type === 'OUT') {
                totalOut += amount;
            }
        });
    
        return { totalIn, totalOut };
    }

    function updateTotalsDisplay() {
        const { totalIn, totalOut } = calculateTotals();
    
        const totalInElement = document.getElementById('total-in');
        const totalOutElement = document.getElementById('total-out');
        const netTotalElement = document.getElementById('net-total');
    
        totalInElement.textContent = `Total In: €${totalIn.toFixed(2)}`;
        totalOutElement.textContent = `Total Out: €${totalOut.toFixed(2)}`;
    
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
    
    loadTransactionsFromAPI();
});