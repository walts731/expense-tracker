// Wait for the page to fully load
document.addEventListener('DOMContentLoaded', () => {

    // Get references to the HTML elements
    const expenseForm = document.getElementById('expense-form');
    const descriptionInput = document.getElementById('description');
    const categoryInput = document.getElementById('category');
    const amountInput = document.getElementById('amount');
    const expenseList = document.getElementById('expense-list');

    // Load expenses from Local Storage or use an empty array
    let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

    // Function to display expenses in the list
    function renderExpenses() {
        // Clear the current list
        expenseList.innerHTML = '';

        // Loop through each expense and create a list item
        expenses.forEach(expense => {
            const li = document.createElement('li');
            li.innerHTML = `
                ${expense.description} (${expense.category})
                <span>$${expense.amount}</span>
            `;
            expenseList.appendChild(li);
        });
    }

    // Function to add a new expense
    function addExpense(e) {
        // Prevent the form from actually submitting (which reloads the page)
        e.preventDefault();

        // Create a new expense object
        const newExpense = {
            description: descriptionInput.value,
            category: categoryInput.value,
            amount: parseFloat(amountInput.value).toFixed(2) // Get value, ensure 2 decimal places
        };

        // Add the new expense to our array
        expenses.push(newExpense);

        // Save the updated array to Local Storage
        // We must convert the array to a JSON string to store it
        localStorage.setItem('expenses', JSON.stringify(expenses));

        // Clear the form fields
        descriptionInput.value = '';
        amountInput.value = '';
        categoryInput.value = 'Food'; // Reset to default

        // Re-display all expenses
        renderExpenses();
    }

    // --- Event Listeners ---

    // Listen for the form submission
    expenseForm.addEventListener('submit', addExpense);

    // Display initial expenses when the page loads
    renderExpenses();
});