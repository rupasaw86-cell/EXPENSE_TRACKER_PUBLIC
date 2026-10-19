const API = "http://localhost:3000";
const SERVER_MSG = "Could not connect to server.Please try again later.";

if (!localStorage.getItem("token")) {
  window.location.href = "index.html";
}

function authHeaders(extra = {}) {
  return { ...extra, Authorization: "Bearer " + localStorage.getItem("token") };
}
const userId = localStorage.getItem("userId");
const userEmail = localStorage.getItem("userEmail");

const nameEl = document.getElementById("userName");
if (nameEl && userEmail) {
  nameEl.innerText = userEmail;
}

let budget = 0;
let incomes = [];
let expenses = [];
let expenseChart = null;

function esc(text) {
  const d = document.createElement("div");
  d.textContent = text == null ? "" : text;
  return d.innerHTML;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-CA");
}

async function loadData() {
  try {
    const budgetRes = await fetch(API + "/budget/" + userId, { headers: authHeaders() });
    const budgetData = await budgetRes.json();
    const txRes = await fetch(API + "/transactions/" + userId, { headers: authHeaders() });
    const rows = await txRes.json();

    budget = Number(budgetData.amount);
    if (!budget) {
      budget = 0;
    }
    incomes = rows.filter(function (r) {
      return r.type === "income";
    });
    expenses = rows.filter(function (r) {
      return r.type === "expense";
    });

    refreshAll();
  } catch (error) {
    alert(SERVER_MSG);
  }
}

function refreshAll() {
  updateSummary();
  displayTransactions();
  createChart();
}

async function saveTransaction(t) {
  try {
    const res = await fetch(API + "/transaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: userId,
        type: t.type,
        title: t.title,
        amount: t.amount,
        category: t.category,
        date: t.date,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.message);
      return false;
    }
    await loadData();
    return true;
  } catch (error) {
    alert(SERVER_MSG);
    return false;
  }
}

async function setBudget() {
  const input = document.getElementById("budgetInput");
  const value = Number(input.value);

  if (!(value > 0)) {
    alert("Please enter a valid budget.");
    return;
  }

  try {
    const res = await fetch(API + "/budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: userId, amount: value }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.message);
      return;
    }
    input.value = "";
    await loadData();
    alert("Budget set successfully!");
  } catch (error) {
    alert(SERVER_MSG);
  }
}

document
  .getElementById("incomeForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    const form = this;
    const ok = await saveTransaction({
      type: "income",
      title: document.getElementById("incomeSource").value,
      amount: Number(document.getElementById("incomeAmount").value),
      category: null,
      date: document.getElementById("incomeDate").value,
    });
    if (ok) {
      form.reset();
    }
  });

document
  .getElementById("expenseForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    const form = this;
    const ok = await saveTransaction({
      type: "expense",
      title: document.getElementById("description").value,
      amount: Number(document.getElementById("amount").value),
      category: document.getElementById("category").value,
      date: document.getElementById("date").value,
    });
    if (ok) {
      form.reset();
    }
  });

function updateSummary() {
  let totalIncome = 0;
  let totalExpense = 0;

  incomes.forEach(function (income) {
    totalIncome += Number(income.amount);
  });

  expenses.forEach(function (expense) {
    totalExpense += Number(expense.amount);
  });

  const remaining = budget - totalExpense;
  document.getElementById("totalIncome").innerText = totalIncome;
  document.getElementById("totalExpense").innerText = totalExpense;
  document.getElementById("remaining").innerText = remaining;
  document.getElementById("budget").innerText = budget;
}

function displayTransactions() {
  const list = document.getElementById("transactionList");
  const search = document.getElementById("search").value.toLowerCase();

  list.innerHTML = "";

  incomes.forEach(function (income) {
    if (income.title.toLowerCase().includes(search)) {
      const row = document.createElement("tr");
      row.innerHTML = 
        '<td class="income">Income</td>' +
        "<td>" + esc(income.title) + "</td>" +
        "<td>₹" + Number(income.amount) + "</td>" +
        "<td>-</td>" +
        "<td>" + formatDate(income.date) + "</td>" +
        '<td><button class="delete-btn" onclick="deleteTransaction(' + income.id + ')">Delete</button></td>';
      list.appendChild(row);
    }
  });

  expenses.forEach(function (expense) {
    let category = expense.category;
    if (!category) {
      category = "";
    }
    const matchTitle = expense.title.toLowerCase().includes(search);
    const matchCategory = category.toLowerCase().includes(search);
    if (matchTitle ? true : matchCategory) {
      const row = document.createElement("tr");
      row.innerHTML = 
        '<td class="expense">Expense</td>' +
        "<td>" + esc(expense.title) + "</td>" +
        "<td>₹" + Number(expense.amount) + "</td>" +
        "<td>" + esc(category) + "</td>" +
        "<td>" + formatDate(expense.date) + "</td>" +
        '<td><button class="delete-btn" onclick="deleteTransaction(' + expense.id + ')">Delete</button></td>';
      list.appendChild(row);
    }
  });
 }

async function deleteTransaction(id) {
  if (!confirm("Are you sure want to delete this entry?")) return;

  try {
    await fetch(API + "/transaction/" + id + "?userId=" + userId, {
      method: "DELETE",
    });
    await loadData();
  } catch (error) {
    alert(SERVER_MSG);
  }
}

function createChart() {
  if (typeof Chart === "undefined") {
    return;
  }

  const categoryTotals = {};

  expenses.forEach(function (expense) {
    let cat = expense.category;
    if (!cat) {
      cat = "Other";
    }
    if (!categoryTotals[cat]) {
      categoryTotals[cat] = 0;
    }
    categoryTotals[cat] += Number(expense.amount);
  });

  const labels = Object.keys(categoryTotals);
  const values = Object.values(categoryTotals);

  const canvas = document.getElementById("expenseChart");
  if (!canvas) {
    return;
  }

  if (expenseChart) {
    expenseChart.destroy();
  }

  expenseChart = new Chart(canvas, {
    type: "pie",
    data: {
      labels: labels,
      datasets: [{ label: "Expenses", data: values }],
    },
    options: { responsive: true },
  });
}

function logout() {
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("userId");
  localStorage.removeItem("userEmail");
  window.location.href = "index.html";
}

loadData();