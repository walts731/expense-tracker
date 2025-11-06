document.addEventListener('DOMContentLoaded', () => {

    // --- 1. STATE ---
    // Load transactions from localStorage, or start with an empty array
    // <-- THIS IS THE "FRESH START" & "LOAD SAVED DATA"
    let transactions = JSON.parse(localStorage.getItem('expenseTrackerTransactions')) || [];

    // --- 2. DOM SELECTORS ---
    const balanceEl = document.getElementById('currentBalance');
    const incomeEl = document.getElementById('totalIncome');
    const expenseEl = document.getElementById('totalExpenses');
    const transactionTableBody = document.getElementById('transactionTableBody');
    const categorySpendBody = document.getElementById('categorySpendBody');
    const addIncomeModal = new bootstrap.Modal(document.getElementById('addIncomeModal'));
    const addExpenseModal = new bootstrap.Modal(document.getElementById('addExpenseModal'));
    const incomeForm = document.getElementById('incomeForm');
    const expenseForm = document.getElementById('expenseForm');

    // --- 3. HELPER FUNCTIONS ---

    // <-- NEW FUNCTION TO SAVE DATA -->
    // Saves the entire 'transactions' array to localStorage
    const saveTransactions = () => {
        localStorage.setItem('expenseTrackerTransactions', JSON.stringify(transactions));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', { 
            style: 'currency', 
            currency: 'PHP' 
        }).format(amount);
    };

    const getCategoryBadge = (category) => {
        if (category === 'Income') return 'badge-soft-income';
        if (category === 'Transport') return 'badge-soft-primary';
        return 'badge-soft-expense';
    };
    
    const getCategoryColor = (category) => {
        if (category === 'Transport') return '#347AB6';
        return '#A94442';
    };

    // --- 4. CORE RENDER FUNCTION ---
    const updateDashboard = () => {
        let totalIncome = 0;
        let totalExpense = 0;
        let categoryTotals = {};

        transactionTableBody.innerHTML = '';
        categorySpendBody.innerHTML = '';

        // Check if there are no transactions
        if (transactions.length === 0) {
            balanceEl.textContent = formatCurrency(0);
            incomeEl.textContent = formatCurrency(0);
            expenseEl.textContent = `-${formatCurrency(0)}`;
            categorySpendBody.innerHTML = '<p class="text-muted">No expenses recorded yet.</p>';
            transactionTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No transactions yet.</td></tr>';
            return; // Stop the function here
        }

        const sortedTransactions = [...transactions].sort((a, b) => b.id - a.id);

        sortedTransactions.forEach(tx => {
            if (tx.type === 'income') {
                totalIncome += tx.amount;
            } else {
                totalExpense += tx.amount;
                categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${tx.date}</td>
                <td>${tx.description}</td>
                <td><span class="badge ${getCategoryBadge(tx.category)} rounded-pill">${tx.category}</span></td>
                <td class="text-end fw-bold ${tx.type === 'income' ? 'text-soft-income' : 'text-soft-expense'}">
                    ${tx.type === 'income' ? '+' : '-'}${formatCurrency(tx.amount)}
                </td>
            `;
            transactionTableBody.appendChild(row);
        });

        const currentBalance = totalIncome - totalExpense;
        balanceEl.textContent = formatCurrency(currentBalance);
        incomeEl.textContent = formatCurrency(totalIncome);
        expenseEl.textContent = `-${formatCurrency(totalExpense)}`;

        if (totalExpense === 0) {
            categorySpendBody.innerHTML = '<p class="text-muted">No expenses recorded yet.</p>';
        } else {
            const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

            for (const [category, amount] of sortedCategories) {
                const percentage = (amount / totalExpense) * 100;
                const color = getCategoryColor(category);
                
                const categoryHtml = `
                    <div class="d-flex justify-content-between mb-2">
                        <span>${category}</span>
                        <span class="fw-bold text-soft-expense">-${formatCurrency(amount)}</span>
                    </div>
                    <div class="progress mb-3" style="height: 10px;">
                        <div class="progress-bar" style="width: ${percentage}%; background-color: ${color};"></div>
                    </div>
                `;
                categorySpendBody.insertAdjacentHTML('beforeend', categoryHtml);
            }
        }
    };

    // --- 5. EVENT LISTENERS ---
    incomeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const description = document.getElementById('incomeDescription').value;
        const amount = parseFloat(document.getElementById('incomeAmount').value);

        if (!description || !amount || amount <= 0) {
            alert('Please enter a valid description and amount.');
            return;
        }

        const newId = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1;
        const newTx = {
            id: newId,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            description: description,
            category: 'Income',
            amount: amount,
            type: 'income'
        };

        transactions.push(newTx);
        saveTransactions(); // <-- SAVE THE DATA
        updateDashboard();
        incomeForm.reset();
        addIncomeModal.hide();
    });

    expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const description = document.getElementById('expenseDescription').value;
        const amount = parseFloat(document.getElementById('expenseAmount').value);
        const category = document.getElementById('expenseCategory').value;

        if (!description || !amount || amount <= 0 || !category) {
            alert('Please fill out all fields with valid data.');
            return;
        }
        
        const newId = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1;
        const newTx = {
            id: newId,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            description: description,
            category: category.charAt(0).toUpperCase() + category.slice(1).toLowerCase(),
            amount: amount,
            type: 'expense'
        };

        transactions.push(newTx);
        saveTransactions(); // <-- SAVE THE DATA
        updateDashboard();
        expenseForm.reset();
        addExpenseModal.hide();
    });

    // --- 6. INITIAL RENDER ---
    updateDashboard();
});