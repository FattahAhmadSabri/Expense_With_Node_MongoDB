const params = new URLSearchParams(window.location.search);
const orderId = params.get("order_id");

document.getElementById("orderId").innerText = `Order ID: ${orderId}`;

const api = "http://localhost:4000/payments";

async function checkPaymentStatus() {
  try {
    const { data } = await axios.get(`${api}/${orderId}`);

    if (!data.success) {
      document.getElementById("status").innerText =
        "Payment verification failed.";
      return;
    }

    const orderStatus = data.data.orderStatus;

    if (orderStatus === "Success") {
      document.getElementById("status").innerText =
        "🎉 Premium Membership Activated!";
      console.log("PAYMENT SUCCESS");
    } else if (orderStatus === "Pending") {
      document.getElementById("status").innerText =
        "Payment is being processed...";

      setTimeout(checkPaymentStatus, 2000);
    } else {
      document.getElementById("status").innerText = "❌ Payment failed.";
    }
  } catch (error) {
    console.error(error);

    document.getElementById("status").innerText = "Unable to verify payment.";
  }
}

if (orderId) {
  checkPaymentStatus();
}
