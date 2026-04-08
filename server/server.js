const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const caseRoutes = require('./routes/caseRoutes');

dotenv.config({ path: '../.env' });

const app = express();

// Connect to MongoDB
connectDB();

// Middleware — allow requests from local dev and Vercel deployment
const allowedOrigins = [
  'http://localhost:3000',
  process.env.CLIENT_URL, // set this to your Vercel URL in Render env vars
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(o => origin.startsWith(o))) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
}));
app.use(express.json());

// Routes
app.use('/api/cases', caseRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Income Assessment API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
