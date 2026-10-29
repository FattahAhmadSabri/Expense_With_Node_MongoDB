const api = "http://localhost:4000/user/login";
const handleLogin = async (event) => {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    const response = await axios.post(api, {
      email,
      password,
    });

    const token = response.data.token;
    const user = response.data.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    console.log(response.data);
    event.target.reset();
    window.location.href = `${window.location.origin}/frontend/expense/expense.html`;
  } catch (error) {
    console.log(error);
    display(error.response.data.message, error.response.status);
  }
};

const display = (message, status) => {
  const ul = document.querySelector("ul");
  const li = document.createElement("li");
  li.textContent = `${status} - ${message}`;
  ul.appendChild(li);
};
