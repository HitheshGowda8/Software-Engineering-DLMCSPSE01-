const Sale = require("../models/Sale");
const Product = require("../models/Product");

// Record sale
const recordSale = async (req, res) => {
  try {
    const { productId, quantitySold } = req.body;

    if (!productId || !quantitySold) {
      return res.status(400).json({ message: "Product and quantity are required" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.quantity < quantitySold) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    const totalAmount = product.price * quantitySold;

    const sale = await Sale.create({
      productId,
      productName: product.name,
      quantitySold,
      totalAmount,
    });

    product.quantity = product.quantity - quantitySold;
    await product.save();

    res.status(201).json({
      message: "Sale recorded successfully",
      sale,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error recording sale",
      error: error.message,
    });
  }
};

// Get all sales
const getSales = async (req, res) => {
  try {
    const sales = await Sale.find().sort({ createdAt: -1 });
    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching sales",
      error: error.message,
    });
  }
};

// Basic report
const getSalesReport = async (req, res) => {
  try {
    const sales = await Sale.find();

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const totalItemsSold = sales.reduce((sum, sale) => sum + sale.quantitySold, 0);

    res.status(200).json({
      totalSales,
      totalRevenue,
      totalItemsSold,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error generating report",
      error: error.message,
    });
  }
};

module.exports = {
  recordSale,
  getSales,
  getSalesReport,
};