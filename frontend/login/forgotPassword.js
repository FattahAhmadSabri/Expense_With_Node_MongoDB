const api = "http://localhost:4000/user/password/forgotPassword";

const handleMailSubmit = async (event) => {
  event.preventDefault();
  const email = document.getElementById("email").value;
  try {
    const response = await axios.post(api, { email });
    console.log(response.data);
    event.target.reset()
  } catch (error) {
    console.log(error);
  }
};
