const router = require('express').Router();
const Supplier = require('../models/supplier.model');

// GET /api/suppliers
router.get('/', async (req, res) => {
  try {
    const suppliers = await Supplier.find({ active: true }).sort({ name: 1 });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/suppliers
router.post('/', async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/suppliers/:id
router.patch('/:id', async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(supplier);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/suppliers/:id
router.delete('/:id', async (req, res) => {
  try {
    await Supplier.findByIdAndUpdate(req.params.id, { active: false });
    res.json({ message: 'Supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;