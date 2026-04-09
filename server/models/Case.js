const mongoose = require('mongoose');

const TurnoverItemSchema = new mongoose.Schema({
  session: String,         // Hotel (Breakfast/Lunch/Dinner), Dairy (Morning/Evening)
  itemName: String,
  qtyPerDay: Number,
  salePrice: Number,
  rate: Number,
  unitsPerDay: Number,
  milkLitres: Number,       // Tea Shop
  cupsPerLitre: Number,     // Tea Shop
  milkPerDay: Number,        // Dairy (litres per session)
  societyQty: Number,       // Dairy
  societyRate: Number,      // Dairy
  individualQty: Number,    // Dairy
  individualRate: Number,   // Dairy
  monthlyQty: Number,       // Tailoring
  ratePerPiece: Number,     // Tailoring
  dailySales: Number,
  monthlySales: Number,
}, { _id: true });

const ExpenseSchema = new mongoose.Schema({
  name: String,
  amount: { type: Number, default: 0 },
}, { _id: false });

const CaseSchema = new mongoose.Schema({
  // Customer Info
  customerName: { type: String, required: true },
  businessName: { type: String, required: true },
  businessType: {
    type: String,
    required: true,
    enum: ['grocery', 'dairy', 'teaShop', 'hotel', 'tailoring']
  },
  location: { type: String },
  assessmentDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['draft', 'in-progress', 'completed'],
    default: 'draft'
  },

  // Turnover Data
  turnover: {
    items: [TurnoverItemSchema],
    totalMonthlyTurnover: { type: Number, default: 0 },
    grossMarginPercent: { type: Number },
    grossProfit: { type: Number, default: 0 },
  },

  // P&L Data
  pnl: {
    expenses: [ExpenseSchema],
    totalExpenses: { type: Number, default: 0 },
    netMonthlyIncome: { type: Number, default: 0 },
  },

  // Eligibility Data
  eligibility: {
    netIncome: { type: Number, default: 0 },
    iirThreshold: { type: Number, default: 50 },
    incomeForLoan: { type: Number, default: 0 },
    roiPercent: { type: Number, default: 16.5 },
    tenureYears: { type: Number, default: 10 },
    tenureMonths: { type: Number, default: 120 },
    emiPerLakh: { type: Number, default: 0 },
    loanEligibility: { type: Number, default: 0 },
    existingEMI: { type: Number, default: 0 },
    recommendedLoan: { type: Number, default: 0 },
    finalEMI: { type: Number, default: 0 },
    iirCurrent: { type: Number, default: 0 },
    iirCombined: { type: Number, default: 0 },
  }
}, { timestamps: true });

module.exports = mongoose.model('Case', CaseSchema);
