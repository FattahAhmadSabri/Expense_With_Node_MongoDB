const api = "http://localhost:4000/expense";

const getAllExpense = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.get(`${api}/premiumexpense`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    displayDailyExpense(response.data.data);
  } catch (error) {
    console.log(error);
  }
};

const displayDailyExpense = (data) => {
  const tbody = document.getElementById("dailyExpenseBody");

  tbody.innerHTML = "";

  data.expenseChart.forEach((item) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${new Date(item.createdAt).toLocaleDateString()}</td>
      <td>${item.description}</td>
      <td>${item.category}</td>
      <td>${item.income != null ? "₹" + item.income : "-"}</td>
      <td>${item.amount != null ? "₹" + item.amount : "-"}</td>
    `;

    tbody.appendChild(row);
  });

  document.getElementById("dailySavingAmount").textContent =
    `₹${data.finalAmount}`;
};

const getMonthlyReport = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.get(`${api}/premium-monthly-report`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    displayMonthlyReport(response.data.data);
  } catch (error) {
    console.log(error);
  }
};

const getYearlyReport = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.get(`${api}/premium-yearly-report`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    displayYearlyReport(response.data.data);
  } catch (error) {
    console.log(error);
  }
};

const displayMonthlyReport = (data) => {
  const tbody = document.getElementById("monthlyExpenseBody");

  tbody.innerHTML = "";

  const row = document.createElement("tr");

  row.innerHTML = `
    <td>${data.month}</td>
    <td>₹${data.totalIncome}</td>
    <td>₹${data.totalExpense}</td>
    <td>₹${data.savings}</td>
  `;

  tbody.appendChild(row);
};

const displayYearlyReport=(data) => {
  const tbody = document.getElementById("yearlyExpenseBody");

  tbody.innerHTML = "";

  const row = document.createElement("tr");

  row.innerHTML = `
    <td>${data.year}</td>
    <td>₹${data.totalIncome}</td>
    <td>₹${data.totalExpense}</td>
    <td>₹${data.savings}</td>
  `;

  tbody.appendChild(row);
};

window.onload = () => {
  getAllExpense();
  getMonthlyReport();
  getYearlyReport();
};
