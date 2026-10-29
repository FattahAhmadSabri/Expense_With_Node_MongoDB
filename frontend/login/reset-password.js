const params = new URLSearchParams(window.location.search);
const userId = params.get("id");

const form = document.getElementById("resetForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const password = document.getElementById("password").value;

  try {
    const response = await axios.patch(
      `http://localhost:4000/user/password/reset/${userId}`,
      {
        password,
      },
    );
     console.log(response.data.message)
   e.target.reset()
  } catch (error) {
    console.log(error)
    
  }
});
