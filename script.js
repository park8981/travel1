document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("expense-form");
  const tableBody = document.getElementById("table-body");
  const totalAmountEl = document.getElementById("total-amount");
  const downloadCSVBtn = document.getElementById("downloadCSV");
  let chart;

  let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

  function saveExpenses() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }

  function updateTotal() {
    const total = expenses.reduce((sum, item) => sum + parseInt(item.amount), 0);
    totalAmountEl.textContent = `₩${total.toLocaleString()}`;
  }

  function updateChart() {
    const categoryTotals = {};

    expenses.forEach(item => {
      categoryTotals[item.category] = (categoryTotals[item.category] || 0) + parseInt(item.amount);
    });

    const data = {
      labels: Object.keys(categoryTotals),
      datasets: [{
        data: Object.values(categoryTotals),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#9b59b6', '#2ecc71', '#f39c12']
      }]
    };

    if (chart) chart.destroy();

    const ctx = document.getElementById('categoryChart').getContext('2d');
    chart = new Chart(ctx, {
      type: 'pie',
      data: data
    });
  }

  function renderExpenses() {
    tableBody.innerHTML = "";
    expenses.forEach((item, index) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${item.date}</td>
        <td>₩${parseInt(item.amount).toLocaleString()}</td>
        <td>${item.category}</td>
        <td>${item.note}</td>
        <td><button class="delete-btn" data-index="${index}">삭제</button></td>
      `;

      tableBody.appendChild(row);
    });

    updateTotal();
    updateChart();
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const date = document.getElementById("date").value;
    const amount = document.getElementById("amount").value;
    const category = document.getElementById("category").value;
    const note = document.getElementById("note").value;

    if (!date || !amount || !category) return;

    const newExpense = { date, amount, category, note };
    expenses.push(newExpense);
    saveExpenses();
    renderExpenses();

    form.reset();
  });

  tableBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
      const index = e.target.dataset.index;
      expenses.splice(index, 1);
      saveExpenses();
      renderExpenses();
    }
  });

  downloadCSVBtn.addEventListener("click", () => {
    let csv = "날짜,금액,항목,메모\n";
    expenses.forEach(item => {
      csv += `${item.date},${item.amount},${item.category},${item.note}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.setAttribute("href", url);
    link.setAttribute("download", "여행_가계부.csv");
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  renderExpenses();
});

const API_URL = "https://travel1-zash.onrender.com";

async function loadExpenses() {
  const res = await fetch(API_URL);
  expenses = await res.json();
  renderExpenses();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const date = document.getElementById("date").value;
  const amount = parseInt(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const note = document.getElementById("note").value;

  const newExpense = { date, amount, category, note };
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newExpense)
  });
  const saved = await res.json();
  expenses.push(saved);
  renderExpenses();
  form.reset();
});

tableBody.addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const index = e.target.dataset.index;
    const id = expenses[index]._id;
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    expenses.splice(index, 1);
    renderExpenses();
  }
});

const API_URL = "https://travel-expense-api.onrender.com";