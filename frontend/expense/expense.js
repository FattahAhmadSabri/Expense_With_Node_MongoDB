const api = "http://localhost:4000/expense";

const getAuthToken = () => {
  const token = localStorage.getItem("token");
  if (!token || token === "null" || token === "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return null;
  }
  return token;
};

const handleAuthError = (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "../login/login.html";
  }
};

const handleExpense = async (event) => {
  event.preventDefault();

  const type = document.getElementById("type").value;
  const value = Number(document.getElementById("amount").value);
  const description = document.getElementById("description").value;
  const createdAt = document.getElementById("date").value;
  const token = getAuthToken();

  if (!token) {
    window.location.href = "../login/login.html";
    return;
  }

  const data = {
    description,
    createdAt,
  };

  if (type === "Expense") {
    data.amount = value;
  } else {
    data.income = value;
  }

  try {
    await axios.post(`${api}/add`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const response = await getData(currentPage);
    display(response.expenses);
    showPagination(response.pagination);
    event.target.reset();
  } catch (error) {
    handleAuthError(error);
    console.log(error);
  }
};
let currentPage = 1;

const getData = async (page = currentPage) => {
  const token = getAuthToken();
  const savedLimit = localStorage.getItem("limit") || 5;
  document.getElementById("limit").value = savedLimit;

  if (!token) {
    window.location.href = "../login/login.html";
    return { expenses: [], pagination: {} };
  }

  try {
    const response = await axios.get(
      `${api}?page=${page}&limit=${savedLimit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    currentPage = page;

    return response.data.data;
  } catch (error) {
    handleAuthError(error);
    console.log(error);
    return { expenses: [], pagination: {} };
  }
};

const handleAddIncome = async () => {
  const token = getAuthToken();
  if (!token) {
    window.location.href = "../login/login.html";
    return;
  }

  try {
    await axios.patch(
      api,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  } catch (error) {
    handleAuthError(error);
    console.log(error);
  }
};

const handledownloadcsv = async (event) => {
  event.preventDefault();

  const token = getAuthToken();
  if (!token) {
    window.location.href = "../login/login.html";
    return;
  }

  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;

  try {
    const response = await axios.get(
      `${api}/range?start=${startDate}&end=${endDate}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      },
    );

    const url = window.URL.createObjectURL(response.data);

    const link = document.createElement("a");
    link.href = url;
    link.download = "expenses.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
  }
};

const display = (data) => {
  const ul = document.querySelector("ul");
  ul.innerHTML = "";

  data.forEach((item) => {
    const li = document.createElement("li");
    const deleteButton = document.createElement("button");

    deleteButton.textContent = "Delete Button";
    deleteButton.onclick = () => {
      deleteExpense(item.id, li);
    };
    const date = new Date(item.createdAt).toLocaleDateString("en-GB");
    if (item.amount === 0) {
      li.textContent = `Income - ${item.income} - ${item.description} - ${item.category} - ${date} `;
    } else {
      li.textContent = `Expense - ${item.amount} - ${item.description} - ${item.category} - ${date} `;
    }

    li.appendChild(deleteButton);

    ul.appendChild(li);
  });
};

const getPremiumData = async () => {
  const token = getAuthToken();
  if (!token) {
    window.location.href = "../login/login.html";
    return [];
  }

  try {
    const response = await axios.get(`${api}/premium`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error) {
    handleAuthError(error);
    handleAuthError(error);
    console.log(error);
    return [];
  }
};

const getpremiumDisplay = (data) => {
  const leaderboard = document.getElementById("leaderboard");
  leaderboard.innerHTML = "";

  data.forEach((item) => {
    const li = document.createElement("li");

    li.textContent = `Name: ${item.name} - Total Expense- ${item.totalExpense}`;

    leaderboard.appendChild(li);
  });
};

const handleLeaderboard = async () => {
  const data = await getPremiumData();
  getpremiumDisplay(data);
};

const deleteExpense = async (id, li) => {
  const token = getAuthToken();
  if (!token) {
    window.location.href = "../login/login.html";
    return;
  }

  try {
    await axios.delete(`${api}/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const response = await getData();

    display(response.expenses);
    showPagination(response.pagination);
  } catch (error) {
    console.log(error);
  }
};

const showPagination = (pagination) => {
  const div = document.getElementById("pagination");
  div.innerHTML = "";

  if (pagination.hasPreviousPage) {
    const prev = document.createElement("button");
    prev.innerText = "Previous";
    prev.onclick = async () => {
      const response = await getData(pagination.previousPage);
      display(response.expenses);
      showPagination(response.pagination);
    };
    div.appendChild(prev);
  }

  if (pagination.hasNextPage) {
    const next = document.createElement("button");
    next.innerText = "Next";
    next.onclick = async () => {
      const response = await getData(pagination.nextPage);
      display(response.expenses);
      showPagination(response.pagination);
    };
    div.appendChild(next);
  }
};

const handleDayByDayExpenses = () => {
  return (window.location.href = "./dayByDayExpense.html");
};

const getCurrentUser = async () => {
  try {
    const token = getAuthToken();

    if (!token) {
      return null;
    }

    const response = await axios.get("http://localhost:4000/user/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

const premiumBtn = document.getElementById("premiumBtn");

const handlepayments = async () => {
  try {
    const token = getAuthToken();

    if (!token) {
      premiumBtn.style.display = "block";
      return;
    }

    const response = await axios.get("http://localhost:4000/user/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const user = response.data.data;

    if (user.isPremium) {
      setPremiumButton();
    } else {
      premiumBtn.innerText = "Buy Premium";
      premiumBtn.disabled = false;
      premiumBtn.style.cursor = "pointer";
    }
  } catch (error) {
    console.log("STATUS:", error.response?.status);
    console.log("SERVER RESPONSE:", error.response?.data);
    console.log("ERROR:", error.message);
    premiumBtn.style.display = "block";
  }
};

function setPremiumButton() {
  premiumBtn.innerText = "You are a Premium Member";
  premiumBtn.disabled = true;
  premiumBtn.style.cursor = "not-allowed";
}

window.addEventListener("pageshow", () => {
  handlepayments();
});

premiumBtn.addEventListener("click", () => {
  window.location.href = "../payments/payments.html";
});

document.getElementById("limit").addEventListener("change", async (e) => {
  localStorage.setItem("limit", e.target.value);

  currentPage = 1;

  const response = await getData();

  display(response.expenses);
  showPagination(response.pagination);
});

window.onload = async () => {
  const token = getAuthToken();
  if (!token) {
    window.location.href = "../login/login.html";
    return;
  }

  const response = await getData();
  display(response.expenses);
  showPagination(response.pagination);
};
