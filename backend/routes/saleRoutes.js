const express = require("express");

const {
  recordSale,
  getSales,
  getSalesReport,
} = require("../controllers/saleController");

const router = express.Router();

router.post("/", recordSale);
router.get("/", getSales);
router.get("/report", getSalesReport);

module.exports = router;