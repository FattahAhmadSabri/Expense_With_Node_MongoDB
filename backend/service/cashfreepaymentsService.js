const { Cashfree, CFEnvironment } = require("cashfree-pg");
const Payment = require("../model/paymentSchema");
const User = require("../model/userSchema");
const mongoose = require("mongoose");

const PREMIUM_AMOUNT = 500;

const cashfree = new Cashfree(
  CFEnvironment.SANDBOX,
  process.env.CASHFREE_CLIENT_ID,
  process.env.CASHFREE_CLIENT_SECRET,
);

const createOrder = async (
  orderId,
  customerId,
  customerPhone,
  orderCurrency = "INR",
) => {
  const session = await mongoose.startSession();

  try {
    const expiryDate = new Date(Date.now() + 60 * 60 * 1000);

    const request = {
      order_id: orderId,
      order_amount: PREMIUM_AMOUNT,
      order_currency: orderCurrency,

      customer_details: {
        customer_id: String(customerId),
        customer_phone: String(customerPhone),
      },

      order_meta: {
        return_url:
          "http://localhost:5501/frontend/payments/payment-success.html?order_id={order_id}",

        notify_url: "http://localhost:4000/api/payment/webhook",

        payment_methods: "cc,dc,upi",
      },

      order_expiry_time: expiryDate.toISOString(),
    };

    console.log("Cashfree Request:", request);

    const response = await cashfree.PGCreateOrder(request);

    console.log("Cashfree Response:", response.data);

    await session.withTransaction(async () => {
      await Payment.create(
        [
          {
            orderId,
            userId: customerId,
            amount: PREMIUM_AMOUNT,
            status: "pending",
          },
        ],
        { session },
      );
    });

    return response.data;
  } catch (error) {
    console.error("Cashfree Error:", error);
    console.error("Error Response:", error.response?.data);
    console.error("Error Message:", error.message);

    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Failed to create Cashfree order.",
    );
  } finally {
    await session.endSession();
  }
};

const getOrderStatus = async (orderId) => {
  const session = await mongoose.startSession();

  try {
    const response = await cashfree.PGOrderFetchPayments(orderId);
    const payments = response.data;

    const successfulPayment = payments.find(
      (payment) => payment.payment_status === "SUCCESS",
    );

    let orderStatus;

    if (successfulPayment) {
      await session.withTransaction(async () => {
        const paymentRecord = await Payment.findOne({ orderId }).session(
          session,
        );

        if (!paymentRecord) {
          throw new Error("Payment record not found");
        }

        if (!paymentRecord.userId) {
          throw new Error("User ID missing from payment record");
        }

        // Verify amount before activating premium
        if (
          Number(successfulPayment.payment_amount) !==
          Number(paymentRecord.amount)
        ) {
          throw new Error("Payment amount mismatch");
        }

        // Update payment
        await Payment.findOneAndUpdate(
          { orderId },
          {
            status: "success",
            paymentId: successfulPayment.cf_payment_id,
          },
          {
            session,
            returnDocument: "after",
          },
        );

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
          paymentRecord.userId,
          { isPremium: true },
          {
            session,
            returnDocument: "after",
          },
        );

        if (!updatedUser) {
          throw new Error(`User not found for ID: ${paymentRecord.userId}`);
        }
      });

      orderStatus = "Success";
    } else if (
      payments.some((payment) => payment.payment_status === "PENDING")
    ) {
      orderStatus = "Pending";
    } else {
      orderStatus = "Failure";
    }

    return {
      orderStatus,
      payments,
    };
  } catch (error) {
    console.error("Get Order Status Error:", error.message);
    throw error;
  } finally {
    await session.endSession();
  }
};

module.exports = {
  createOrder,
  getOrderStatus,
};
