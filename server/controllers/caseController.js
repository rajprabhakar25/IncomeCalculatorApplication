const mongoose = require('mongoose');
const Case = require('../models/Case');

// Helper — detect invalid ObjectId and return 400 instead of 500
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Create a new case
const createCase = async (req, res) => {
  try {
    const newCase = new Case(req.body);
    const saved = await newCase.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all cases with optional search/filter
const getCases = async (req, res) => {
  try {
    const { search, businessType, status } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { businessName: { $regex: search, $options: 'i' } },
      ];
    }

    if (businessType && businessType !== 'all') {
      query.businessType = businessType;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const cases = await Case.find(query).sort({ updatedAt: -1 });
    res.json(cases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single case by ID
const getCaseById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid case ID format' });
    }
    const found = await Case.findById(req.params.id);
    if (!found) return res.status(404).json({ message: 'Case not found' });
    res.json(found);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a case — use explicit $set to prevent NoSQL operator injection
const updateCase = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid case ID format' });
    }
    const updated = await Case.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Case not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a case
const deleteCase = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid case ID format' });
    }
    const deleted = await Case.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Case not found' });
    res.json({ message: 'Case deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createCase, getCases, getCaseById, updateCase, deleteCase };
