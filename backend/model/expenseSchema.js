const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      default: null,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },

    income: {
      type: Number,
      default: null,
      min: [0, "Income cannot be negative"],
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);


expenseSchema.index({ userId: 1, createdAt: 1 });

const Expense = mongoose.model("Expense", expenseSchema);

module.exports = Expense;
