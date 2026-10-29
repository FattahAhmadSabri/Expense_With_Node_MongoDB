const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const compression = require("compression");
const morgan = require("morgan");
dotenv.config();

const userRoutes = require("./routes/userRoutes");
const { globalErrorHandler } = require("./middleware/responseHandle");
const expenseRoutes = require("./routes/expenseRoutes");
const paymentsRoutes = require("./routes/paymetsRoute");
const emailRoutes = require("./routes/emailRoutes");
const dbConfig = require("./utils/dbConfig");

const { globalLimiter } = require("./middleware/rateLimitingMiddleware");

const app = express();
const port = process.env.PORT || 4000;
app.use(compression());
// app.use(morgan("combined"));
app.use(express.json());
app.use(cors());
app.use(globalLimiter);
app.use(globalErrorHandler);

app.get("/", (req, res) => {
  res.status(200).json("expense working");
});

app.use("/", userRoutes);
app.use("/", expenseRoutes);
app.use("/", paymentsRoutes);
app.use("/", emailRoutes);

app.listen(port, () => {
  dbConfig();
  console.log(`Server running on port ${port}`);
});
