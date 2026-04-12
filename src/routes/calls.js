const router = require('express').Router();
const Call   = require('../models/call.model');

// GET /api/calls — tous les appels pending
router.get('/', async (req, res) => {
  try {
    const calls = await Call.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json(calls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/calls — nouveau appel
router.post('/', async (req, res) => {
  try {
    // Supprimer les anciens appels de la même table
    await Call.deleteMany({ tableNumber: req.body.tableNumber });
    const call = await Call.create({ tableNumber: req.body.tableNumber });
    res.status(201).json(call);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/calls/:id — marquer comme répondu
router.patch('/:id', async (req, res) => {
  try {
    const call = await Call.findByIdAndUpdate(
      req.params.id,
      { status: 'answered' },
      { new: true }
    );
    res.json(call);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;