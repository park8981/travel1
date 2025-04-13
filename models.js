const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
  date: String,
  amount: Number,
  category: String,
  note: String
});

module.exports = mongoose.model("Expense", ExpenseSchema);
