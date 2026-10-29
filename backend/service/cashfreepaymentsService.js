const { Cashfree, CFEnvironment } = require("cashfree-pg");
const Payment = require("../model/paymentSchema")
const User = require("../model/userSchema");

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
  try {
    const expiryDate = new Date(Date.now() + 60 * 60 * 1000);

    const request = {
      order_id: orderId,
      order_amount: PREMIUM_AMOUNT,
      order_currency: orderCurrency,

      customer_details: {
        customer_id: customerId,
        customer_phone: customerPhone,
      },

      order_meta: {
        return_url:
          "http://localhost:5500/frontend/payments/payment-success.html?order_id={order_id}",
        notify_url: "http://localhost:4000/api/payment/webhook",
        payment_methods: "cc,dc,upi",
      },

      order_expiry_time: expiryDate.toISOString(),
    };
    console.log(request);
    const response = await cashfree.PGCreateOrder(request);
    await Payment.create({
      orderId,
      userId: customerId,
      amount: PREMIUM_AMOUNT,
      status: "Pending",
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to create Cashfree order.",
    );
  }
};

const getOrderStatus = async (orderId) => {
  const transaction = await sequelize.transaction();

  try {
    const response = await cashfree.PGOrderFetchPayments(orderId);
    const payments = response.data;

    let orderStatus;

    const successfulPayment = payments.find(
      (payment) => payment.payment_status === "SUCCESS",
    );

    if (successfulPayment) {
      orderStatus = "Success";

      const paymentRecord = await Payment.findOne({
        where: { orderId },
        transaction,
      });

      if (paymentRecord) {
        await Payment.update(
          {
            status: "Success",
            paymentId: successfulPayment.cf_payment_id,
          },
          {
            where: { orderId },
            transaction,
          },
        );

        await User.update(
          { isPremium: true },
          {
            where: {
              id: paymentRecord.userId,
            },
            transaction,
          },
        );
        
      }
    } else if (
      payments.some((payment) => payment.payment_status === "PENDING")
    ) {
      orderStatus = "Pending";
    } else {
      orderStatus = "Failure";
    }

    await transaction.commit();

    return {
      orderStatus,
      payments,
    };
  } catch (error) {
    await transaction.rollback();

    throw error;
  }
};
module.exports = { createOrder, getOrderStatus };
