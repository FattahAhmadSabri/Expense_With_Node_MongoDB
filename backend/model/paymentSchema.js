const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: [true, "Order ID is required"],
      unique: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },

    amount: {
      type: Number,
      required: [true, "Amount is required"],
    },

    status: {
      type: String,
      enum: ["pending", "success", "failure"],
      default: "pending",
    },

    paymentId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
