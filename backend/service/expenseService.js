const Expense = require("../model/expenseSchema");
const mongoose = require("mongoose");
const User = require("../model/userSchema");
const { GoogleGenAI } = require("@google/genai");
const { Parser } = require("json2csv");
const { uploadUserData, downloadUserData } = require("../utils/txtS3");
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const addExpenseService = async (
  amount,
  income,
  description,
  userId,
  createdAt,
) => {
  amount = Number(amount) || 0;
  income = Number(income) || 0;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: `Classify this expense description into exactly one word: "${description}"`,
    config: {
      systemInstruction:
        "Return exactly one category word: Food, Transport, Utilities, Medical, Entertainment, or Other.",
    },
  });

  const category = response.text?.trim() || "Other";

  const expense = await Expense.create({
    amount,
    income,
    description,
    category,
    userId,
    createdAt,
  });

  const user = await User.findByIdAndUpdate(
    userId,
    { $inc: { totalExpense: amount } },
    { new: true },
  );

  if (!user) {
    await Expense.findByIdAndDelete(expense._id);
    throw new Error("User not found");
  }

  await uploadUserData(userId, {
    id: user._id.toString(),
    totalExpense: user.totalExpense,
    amount,
  });

  return expense;
};
const getExpenseService = async (userId, page, limit) => {
  page = Number(page) || 1;
  limit = Number(limit) || 10;

  const skip = (page - 1) * limit;

  const [expenses, totalItems] = await Promise.all([
    Expense.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),

    Expense.countDocuments({ userId }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return {
    expenses,
    pagination: {
      currentPage: page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
      totalItems,
    },
  };
};

const getExpenseByAllName = async (userId) => {
  const user = await User.findById(userId).select("isPremium");

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.isPremium) {
    throw new Error("Only premium members can access this feature.");
  }

  const result = await User.find({})
    .select("name totalExpense")
    .sort({ totalExpense: -1 })
    .limit(10);

  return result;
};

const deleteExpenseService = async (id, userId) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Find the expense belonging to this user
    const expense = await Expense.findOne({
      _id: id,
      userId: userId,
    }).session(session);

    if (!expense) {
      throw new Error("Expense not found");
    }

    // Delete the expense
    await Expense.deleteOne({ _id: id, userId: userId }, { session });

    // Decrease the user's total expense
    await User.findByIdAndUpdate(
      userId,
      {
        $inc: { totalExpense: -Number(expense.amount || 0) },
      },
      { session },
    );

    await session.commitTransaction();

    return true;
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    throw error;
  } finally {
    await session.endSession();
  }
};

const getExpenseForPremiumMember = async (userId) => {
  const user = await User.findById(userId).select("isPremium totalExpense");

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.isPremium) {
    throw new Error("Only premium members can access this feature.");
  }

  const expenseChart = await Expense.find({ userId });

  const totalIncome = expenseChart.reduce(
    (sum, item) => sum + (item.income || 0),
    0,
  );

  const totalExpenses = user.totalExpense || 0;

  const finalAmount = totalIncome - totalExpenses;

  return {
    expenseChart,
    finalAmount,
  };
};

const monthlyExpenseAndIncomeReportService = async (userId) => {
  // Check user and premium status
  const user = await User.findById(userId).select("isPremium");

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.isPremium) {
    throw new Error("Only premium members can access this feature.");
  }

  const now = new Date();

  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [result] = await Expense.aggregate([
    {
      $match: {
        userId: user._id,
        createdAt: {
          $gte: start,
          $lt: end,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalIncome: { $sum: { $ifNull: ["$income", 0] } },
        totalExpense: { $sum: { $ifNull: ["$amount", 0] } },
      },
    },
  ]);

  const totalIncome = result?.totalIncome || 0;
  const totalExpense = result?.totalExpense || 0;

  const monthName = start.toLocaleString("en-US", {
    month: "long",
  });

  return {
    month: monthName,
    year: start.getFullYear(),
    totalIncome,
    totalExpense,
    savings: totalIncome - totalExpense,
  };
};

const yearlyExpenseAndIncomeReportService = async (userId) => {
  // Check user and premium status
  const user = await User.findById(userId).select("isPremium");

  if (!user) {
    throw new Error("User not found");
  }

  if (!user.isPremium) {
    throw new Error("Only premium members can access this feature.");
  }

  const now = new Date();

  const start = new Date(now.getFullYear(), 0, 1);
  start.setHours(0, 0, 0, 0);

  // Start of the next year (exclusive)
  const end = new Date(now.getFullYear() + 1, 0, 1);
  end.setHours(0, 0, 0, 0);

  // Calculate yearly income and expenses
  const [result] = await Expense.aggregate([
    {
      $match: {
        userId: user._id,
        createdAt: {
          $gte: start,
          $lt: end,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalIncome: {
          $sum: { $ifNull: ["$income", 0] },
        },
        totalExpense: {
          $sum: { $ifNull: ["$amount", 0] },
        },
      },
    },
  ]);

  const totalIncome = result?.totalIncome || 0;
  const totalExpense = result?.totalExpense || 0;

  return {
    year: now.getFullYear(),
    totalIncome,
    totalExpense,
    savings: totalIncome - totalExpense,
  };
};

const updateExpenseIncomeService = async (id, userId, income) => {
  // Check whether the user exists
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  // Update income only for the expense belonging to this user
  const updatedExpense = await Expense.findOneAndUpdate(
    {
      _id: id,
      userId: userId,
    },
    {
      $set: { income: Number(income) },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedExpense) {
    throw new Error("Expense not found");
  }

  return updatedExpense;
};

const getExpenseByIdApplyFilter = async (startDate, endDate, userId) => {
  const expenseData = await Expense.find({
    userId,
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  }).sort({ createdAt: -1 });

  return expenseData;
};
module.exports = {
  addExpenseService,
  getExpenseService,
  deleteExpenseService,
  getExpenseByAllName,
  getExpenseForPremiumMember,
  updateExpenseIncomeService,
  monthlyExpenseAndIncomeReportService,
  getExpenseByIdApplyFilter,
  yearlyExpenseAndIncomeReportService,
};
