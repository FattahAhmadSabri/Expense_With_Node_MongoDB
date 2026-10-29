// const payment = JSON.parse(sessionStorage.getItem("paymentData"));

// const status = document.getElementById("status");

// if (!payment) {
//   status.innerText = "Payment Data Not Found";
// } else {
//   const data = payment.data;

//   document.getElementById("amount").innerText = `₹${data.order_amount}`;

//   document.getElementById("orderId").innerText = data.order_id;

//   document.getElementById("cfOrderId").innerText = data.cf_order_id;

//   document.getElementById("phone").innerText =
//     data.customer_details.customer_phone;

//   document.getElementById("created").innerText = new Date(
//     data.created_at,
//   ).toLocaleString();

//   switch (data.order_status) {
//     case "SUCCESS":
//     case "PAID":
//       status.innerText = "✅ Payment Successful";
//       break;

//     case "FAILED":
//       status.innerText = "❌ Payment Failed";
//       break;

//     default:
//       status.innerText = "⏳ Payment Pending";
//       break;
//   }
// }
