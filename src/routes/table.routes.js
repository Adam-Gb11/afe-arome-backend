const router = require('express').Router();
const Table  = require('../models/table.model');

// GET /api/tables — récupérer toutes les tables
router.get('/', async (req, res) => {
  try {
    const tables = await Table.find({ active: true }).sort({ number: 1 });
    res.json(tables);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tables — créer une table
router.post('/', async (req, res) => {
  try {
    const table = await Table.create(req.body);
    res.status(201).json(table);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;