const express = require("express");
const authMiddleware = require("../middleware/authenticateMiddleware");
const {
  cashfreeOrderController,
  getOrderStatusCashfreeController,
} = require("../controller/cashfreeOrderController");
const {
  getPaymentController,
} = require("../controller/paymentRecordController");
const router = express.Router();

router.post("/payments/create_order", authMiddleware, cashfreeOrderController);
router.get("/payments/:orderId", getOrderStatusCashfreeController);
router.get("/payments/status/:orderId", getPaymentController);

module.exports = router;
