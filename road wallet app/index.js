import { initializeApp } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, set } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  databaseURL: "https://road-wallet-app-2e38b-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// Initialize Firebase App and Database Reference
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const expensesRef = ref(database, "expenses"); // Reference to expenses in the database
const travelersRef = ref(database, "travelers"); // Reference to travelers in the database

// Retrieve necessary elements for manipulation
const expenseForm = document.getElementById("expense-form");
const totalExpensesAmountElement = document.getElementById("total-expenses-amount");
const expenseList = document.getElementById("expense-list");
const modal = document.getElementById("travelers-modal");
const openModalButton = document.getElementById("open-modal-button");
const closeButton = document.querySelector(".close-button");
const travelersForm = document.getElementById("travelers-form");
const travelerNameInput = document.getElementById("traveler-name");
const travelersList = document.getElementById("travelers-list");

// Initialize arrays to store expense and traveler data
let expenses = [];
let travelers = [];

// Event listener to show the modal when the button is clicked
openModalButton.addEventListener("click", function () {
  modal.classList.add("display-modal");
});

// Event listener to hide the modal when the close button is clicked
closeButton.addEventListener("click", function () {
  modal.classList.remove("display-modal");
});

// Event listener to close the modal if clicked outside of it
window.addEventListener("click", function (event) {
  if (event.target === modal) {
    modal.classList.remove("display-modal");
  }
});

// Handle form submission for expenses
expenseForm.addEventListener("submit", function (event) {
  event.preventDefault();
  handleNewExpense();
});

// Handle form submission for adding a new traveler
travelersForm.addEventListener("submit", function (event) {
  event.preventDefault();
  handleNewTraveler();
});

// Function to process a new expense entry and save to Firebase
function handleNewExpense() {
  const category = document.getElementById("expense-category").value;
  const amount = parseInt(document.getElementById("expense-amount").value);
  const newExpenseRef = push(expensesRef);
  set(newExpenseRef, { category, amount }); // Save new expense to Firebase
  expenseForm.reset();
}

// Function to process adding a new traveler and save to Firebase
function handleNewTraveler() {
  const travelerName = travelerNameInput.value.trim();
  if (travelerName !== "") {
    const newTravelerRef = push(travelersRef);
    set(newTravelerRef, { name: travelerName }); // Save new traveler to Firebase
    travelerNameInput.value = "";
  }
}

// Function to remove an expense from Firebase
function deleteExpense(expenseId) {
  remove(ref(database, `expenses/${expenseId}`)); // Remove the expense from Firebase
}

// Function to remove a traveler from Firebase
function removeTraveler(travelerId) {
  remove(ref(database, `travelers/${travelerId}`)); // Remove the traveler from Firebase
}

// Real-time listener for expenses
onValue(expensesRef, (snapshot) => {
  expenses = [];
  snapshot.forEach((childSnapshot) => {
    const expense = childSnapshot.val();
    expense.id = childSnapshot.key; // Store Firebase key as id in expense object
    expenses.push(expense);
  });
  updateDisplays();
});

// Real-time listener for travelers
onValue(travelersRef, (snapshot) => {
  travelers = [];
  snapshot.forEach((childSnapshot) => {
    const traveler = childSnapshot.val();
    traveler.id = childSnapshot.key; // Store Firebase key as id in traveler object
    travelers.push(traveler);
  });
  updateDisplays();
});

// Function to update all relevant displays (expenses and travelers)
function updateDisplays() {
  calculateAmountOwed();
  updateTotalExpensesAmount();
  updateExpenseList();
  updateTravelersList();
}

// Calculate the amount each traveler owes and update their record
function calculateAmountOwed() {
  if (travelers.length === 0) return;
  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const amountPerTraveler = (totalExpense / travelers.length).toFixed(2);
  travelers.forEach(traveler => traveler.amountOwed = amountPerTraveler);
}

// Update the total expenses display
function updateTotalExpensesAmount() {
  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  totalExpensesAmountElement.textContent = "$" + totalExpense;
}

// Refresh the list of expenses on the page
function updateExpenseList() {
  expenseList.innerHTML = "";
  expenses.forEach(function (expense) {
    addExpenseToList(expense);
  });
}

// Add a single expense item to the list
function addExpenseToList(expense) {
  const expenseItem = document.createElement("li");
  expenseItem.textContent = expense.category + ": $" + expense.amount;
  const deleteIcon = createDeleteButton(expense.id, deleteExpense);
  expenseItem.appendChild(deleteIcon);
  expenseList.appendChild(expenseItem);
}

// Refresh the list of travelers on the page
function updateTravelersList() {
  travelersList.innerHTML = "";
  travelers.forEach(function (traveler) {
    addTravelerToList(traveler);
  });
}

// Add a single traveler to the list
function addTravelerToList(traveler) {
  const travelerItem = document.createElement("div");
  travelerItem.classList.add("traveler-item");
  travelerItem.textContent = traveler.name + ": $" + traveler.amountOwed;
  const removeButton = createDeleteButton(traveler.id, removeTraveler);
  travelerItem.appendChild(removeButton);
  travelersList.appendChild(travelerItem);
}

// Helper function to create a delete button for both expenses and travelers
function createDeleteButton(id, deleteFunction) {
  const button = document.createElement("button");
  button.innerHTML = "<i class='fas fa-trash-alt'></i>";
  button.addEventListener("click", function () {
    deleteFunction(id);
  });
  return button;
}

