const express = require('express');
const router = express.Router();
const {
  createCase,
  getCases,
  getCaseById,
  updateCase,
  deleteCase,
} = require('../controllers/caseController');

router.post('/', createCase);
router.get('/', getCases);
router.get('/:id', getCaseById);
router.put('/:id', updateCase);
router.delete('/:id', deleteCase);

module.exports = router;
