/**
 * Prefilled sample data for all 5 business types.
 * Loaded automatically when a new case is created.
 * All values are editable by the officer — these are defaults, not locked.
 *
 * turnoverItems schema must match what each Turnover component expects.
 * eligibility schema must match EligibilityModule saved fields.
 */

export const SAMPLE_DATA = {

  // ─── GROCERY / KIRANA / PROVISION SHOP ──────────────────────────────────────
  // Turnover method: item-wise. dailySales = qtyPerDay × salePrice. monthlySales = dailySales × 25.
  grocery: {
    turnoverItems: [
      { itemName: 'Crystal Salt',    qtyPerDay: 10, salePrice: 20  },
      { itemName: 'Turmeric Powder', qtyPerDay: 2,  salePrice: 150 },
      { itemName: 'Chilli Powder',   qtyPerDay: 1,  salePrice: 140 },
      { itemName: 'Sambar Masala',   qtyPerDay: 1,  salePrice: 140 },
      { itemName: 'Dhaniya Powder',  qtyPerDay: 1,  salePrice: 160 },
      { itemName: 'Pepper',          qtyPerDay: 1,  salePrice: 300 },
      { itemName: 'Red Chilli',      qtyPerDay: 2,  salePrice: 500 },
      { itemName: 'Sugar',           qtyPerDay: 4,  salePrice: 55  },
      { itemName: 'Garlic',          qtyPerDay: 1,  salePrice: 120 },
      { itemName: 'Coconut Oil',     qtyPerDay: 1,  salePrice: 220 },
      { itemName: 'Sunflower Oil',   qtyPerDay: 5,  salePrice: 150 },
      { itemName: 'Groundnut Oil',   qtyPerDay: 2,  salePrice: 240 },
      { itemName: 'Bengal Gram',     qtyPerDay: 1,  salePrice: 120 },
      { itemName: 'Appalam',         qtyPerDay: 3,  salePrice: 40  },
      { itemName: 'Shampoo',         qtyPerDay: 20, salePrice: 1   },
      { itemName: 'Noodles',         qtyPerDay: 5,  salePrice: 40  },
      { itemName: 'Maida',           qtyPerDay: 3,  salePrice: 240 },
      { itemName: 'Rava',            qtyPerDay: 3,  salePrice: 120 },
      { itemName: 'Semiya',          qtyPerDay: 4,  salePrice: 25  },
      { itemName: 'Rice Flour',      qtyPerDay: 5,  salePrice: 30  },
      { itemName: 'Washing Powder',  qtyPerDay: 2,  salePrice: 60  },
      { itemName: 'Milk Biscuit',    qtyPerDay: 20, salePrice: 10  },
      { itemName: 'Marie Biscuit',   qtyPerDay: 30, salePrice: 10  },
      { itemName: 'Cream Biscuit',   qtyPerDay: 10, salePrice: 10  },
      { itemName: 'Rice Raw',        qtyPerDay: 10, salePrice: 40  },
      { itemName: 'Others',          qtyPerDay: 50, salePrice: 30  },
    ],
    // Verification: totalMonthlyTurnover = 211000, grossProfit = 52750 (25%), netIncome = 37750
    eligibility: {
      iirThreshold:    50,
      roiPercent:      16.5,
      tenureYears:     10,
      existingEMI:     0,
      recommendedLoan: 1000000,
    },
  },

  // ─── DAIRY BUSINESS ─────────────────────────────────────────────────────────
  // Turnover method: session-wise (Morning/Evening).
  // incomePerDay = societyQty × societyRate + individualQty × individualRate. incomePerMonth × 30.
  // Items are in order: [0] = Morning, [1] = Evening (matched by index in DairyTurnover).
  dairy: {
    turnoverItems: [
      { milkPerDay: 40, societyQty: 40, societyRate: 35, individualQty: 0, individualRate: 0 }, // Morning
      { milkPerDay: 30, societyQty: 30, societyRate: 35, individualQty: 0, individualRate: 0 }, // Evening
    ],
    // Verification: totalMonthlyTurnover = 73500, grossProfit = 51450 (70%), netIncome = 43950
    // NOTE: Dairy uses 45% IIR threshold (not 50%).
    eligibility: {
      iirThreshold:    45,
      roiPercent:      16.5,
      tenureYears:     10,
      existingEMI:     0,
      recommendedLoan: 650000,
    },
  },

  // ─── TEA SHOP / SNACK BAR ────────────────────────────────────────────────────
  // Turnover method: product-wise.
  // Tea/coffee: dailySales = milkLitres × cupsPerLitre × rate. Snack: dailySales = qtyPerDay × rate.
  // monthlySales = dailySales × 30.
  teaShop: {
    turnoverItems: [
      { itemType: 'tea',   itemName: 'Tea & Coffee', milkLitres: 30, cupsPerLitre: 15, qtyPerDay: 0,   rate: 12 },
      { itemType: 'snack', itemName: 'Vadai, Bajji', milkLitres: 0,  cupsPerLitre: 0,  qtyPerDay: 100, rate: 12 },
    ],
    // Verification: totalMonthlyTurnover = 198000, grossProfit = 99000 (50%), netIncome = 53500
    eligibility: {
      iirThreshold:    50,
      roiPercent:      16.5,
      tenureYears:     10,
      existingEMI:     0,
      recommendedLoan: 650000,
    },
  },

  // ─── HOTEL / RESTAURANT / EATERY ─────────────────────────────────────────────
  // Turnover method: session + item-wise. dailySales = rate × unitsPerDay. monthlySales × 25.
  hotel: {
    turnoverItems: [
      // Breakfast
      { session: 'Breakfast', itemName: 'Tea',                    rate: 10, unitsPerDay: 100 },
      { session: 'Breakfast', itemName: 'Coffee',                 rate: 9,  unitsPerDay: 20  },
      { session: 'Breakfast', itemName: 'Vadai, Bonda, and Snack Items', rate: 5, unitsPerDay: 50 },
      { session: 'Breakfast', itemName: 'Idly',                   rate: 3,  unitsPerDay: 40  },
      { session: 'Breakfast', itemName: 'Dosai',                  rate: 15, unitsPerDay: 20  },
      { session: 'Breakfast', itemName: 'Poori',                  rate: 10, unitsPerDay: 30  },
      { session: 'Breakfast', itemName: 'Half Boil and Omelette', rate: 20, unitsPerDay: 20  },
      // Lunch
      { session: 'Lunch', itemName: 'Meals',                      rate: 80,  unitsPerDay: 40 },
      { session: 'Lunch', itemName: 'Meals (Parcel)',              rate: 100, unitsPerDay: 20 },
      { session: 'Lunch', itemName: 'Mutton Biryani',             rate: 100, unitsPerDay: 20 },
      { session: 'Lunch', itemName: 'Chicken Biryani',            rate: 100, unitsPerDay: 30 },
      { session: 'Lunch', itemName: 'Chicken Gravy',              rate: 80,  unitsPerDay: 15 },
      { session: 'Lunch', itemName: 'Fish Fry',                   rate: 50,  unitsPerDay: 10 },
      { session: 'Lunch', itemName: 'Half Boil and Omelette',     rate: 20,  unitsPerDay: 20 },
      // Dinner
      { session: 'Dinner', itemName: 'Dosai',                     rate: 15, unitsPerDay: 30 },
      { session: 'Dinner', itemName: 'Parotta',                   rate: 10, unitsPerDay: 50 },
      { session: 'Dinner', itemName: 'Chappathi',                 rate: 10, unitsPerDay: 20 },
      { session: 'Dinner', itemName: 'Idly',                      rate: 3,  unitsPerDay: 40 },
      { session: 'Dinner', itemName: 'Half Boil and Omelette',    rate: 10, unitsPerDay: 20 },
    ],
    // Verification: totalMonthlyTurnover = 408000, grossProfit = 204000 (50%), netIncome = 63000
    // NOTE: Hotel uses 21% ROI (not 16.5%).
    eligibility: {
      iirThreshold:    50,
      roiPercent:      21,
      tenureYears:     10,
      existingEMI:     0,
      recommendedLoan: 1000000,
    },
  },

  // ─── TAILORING BUSINESS ──────────────────────────────────────────────────────
  // Turnover method: order-note (monthly directly). monthlyIncome = monthlyQty × ratePerPiece.
  tailoring: {
    turnoverItems: [
      { itemName: 'Pant',                     monthlyQty: 40, ratePerPiece: 400 },
      { itemName: 'Half Pant',                monthlyQty: 20, ratePerPiece: 200 },
      { itemName: 'Full Shirt',               monthlyQty: 40, ratePerPiece: 300 },
      { itemName: 'Half Shirt',               monthlyQty: 20, ratePerPiece: 150 },
      { itemName: 'Blouse with Lining',       monthlyQty: 50, ratePerPiece: 250 },
      { itemName: 'Blouse without Lining',    monthlyQty: 50, ratePerPiece: 150 },
      { itemName: 'Chudithar with Lining',    monthlyQty: 20, ratePerPiece: 500 },
      { itemName: 'Chudithar without Lining', monthlyQty: 20, ratePerPiece: 400 },
    ],
    // Verification: totalMonthlyTurnover = 73000, grossProfit = 62050 (85%), netIncome = 32050
    // NOTE: Tailoring uses 21% ROI (not 16.5%).
    eligibility: {
      iirThreshold:    50,
      roiPercent:      21,
      tenureYears:     10,
      existingEMI:     0,
      recommendedLoan: 800000,
    },
  },
};
