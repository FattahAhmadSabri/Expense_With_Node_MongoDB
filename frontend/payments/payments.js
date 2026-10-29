// const api = "http://localhost:4000/payments/create_order";
// const handlePayment = async (event) => {
//   event.preventDefault();

//   const orderAmount = document.getElementById("amount").value;
//   const customerPhone = document.getElementById("phone").value;

//   try {
//     const response = await axios.post(
//       api,
//       {
//         orderAmount,
//         customerPhone,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       },
//     );
//     const paymentSessionId = response.data.data.paymentSessionId;
//     sessionStorage.setItem("paymentSessionId", paymentSessionId);

//     window.location.href = "./paymentStatus.html";
//     console.log(response.data);
//     event.target.reset();
//   } catch (error) {
//     console.log(error.response?.data || error.message);
//   }
// };
