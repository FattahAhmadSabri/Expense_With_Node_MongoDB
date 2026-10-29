const { Parser } = require("json2csv");
const {
  addExpenseService,
  getExpenseService,
  deleteExpenseService,
  getExpenseByAllName,
  getExpenseForPremiumMember,
  updateExpenseIncomeService,
  monthlyExpenseAndIncomeReportService,
  getExpenseByIdApplyFilter,
  yearlyExpenseAndIncomeReportService,
} = require("../service/expenseService");

const {
  successResponse,
  errorResponse,
} = require("../middleware/responseHandle");
const { removeTicks } = require("sequelize/lib/utils");
const createExpenseController = async (req, res) => {
  try {
    const { amount, income, description, createdAt } = req.body;
    const userId = req.user.id;
    const response = await addExpenseService(
      amount,
      income,
      description,
      userId,
      createdAt,
    );
    return successResponse(res, 201, "amount added successfully", response);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

const getExpenseController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page, limit } = req.query;

    const response = await getExpenseService(userId, page, limit);

    return successResponse(res, 200, "amount listed successfully", response);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

const getAllExpenseGroupByUserController = async (req, res) => {
  try {
    const response = await getExpenseByAllName(req.user.id);
    return successResponse(res, 200, "amount listed successfully", response);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

const deleteExpenseController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const response = await deleteExpenseService(id, userId);
    return successResponse(res, 200, "Expens deleted successfully", response);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

const getExpenseForPremiumMemberController = async (req, res) => {
  try {
    const expenseHistory = await getExpenseForPremiumMember(req.user.id);
    return successResponse(
      res,
      200,
      "Expense data successfully",
      expenseHistory,
    );
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

const updateIncomeController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { income } = req.body;
    const response = await updateExpenseIncomeService(id, userId, income);
    return successResponse(res, 200, "Added Income successfully", response);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

const monthlyExpenseAndIncomeReportController = async (req, res) => {
  try {
    const userId = req.user.id;
    const response = await monthlyExpenseAndIncomeReportService(userId);
    return successResponse(res, 200, "Added Income successfully", response);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

const yearlyExpenseAndIncomeReportController = async (req, res) => {
  try {
    const userId = req.user.id;
    const response = await yearlyExpenseAndIncomeReportService(userId);
    return successResponse(res, 200, "Added Income successfully", response);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

const getExpenseByIdApplyFilterController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { start, end } = req.query;
    const response = await getExpenseByIdApplyFilter(start, end, userId);

    const fields = ["amount", "income", "description", "category", "createdAt"];

    const parser = new Parser({ fields });
    const csv = parser.parse(response);

    res.header("Content-Type", "text/csv");
    res.attachment("expenses.csv");

    return res.send(csv);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

module.exports = {
  createExpenseController,
  getExpenseController,
  deleteExpenseController,
  getAllExpenseGroupByUserController,
  getExpenseForPremiumMemberController,
  updateIncomeController,
  monthlyExpenseAndIncomeReportController,
  getExpenseByIdApplyFilterController,
  yearlyExpenseAndIncomeReportController,
};
