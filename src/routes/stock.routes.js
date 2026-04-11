const router = require('express').Router();
const StockItem     = require('../models/stockItem.model');
const StockMovement = require('../models/stockMovement.model');

// ── GET /api/stock — tous les articles ──────────────────────────
router.get('/', async (req, res) => {
  try {
    const items = await StockItem.find().populate('supplier', 'name phone').sort({ name: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/stock/alerts — articles en stock bas ───────────────
router.get('/alerts', async (req, res) => {
  try {
    const items = await StockItem.find().populate('supplier', 'name phone');
    const low = items.filter(i => i.quantity <= i.minQuantity);
    res.json(low);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/stock — créer un article ──────────────────────────
router.post('/', async (req, res) => {
  try {
    const item = await StockItem.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── PATCH /api/stock/:id — modifier un article ──────────────────
router.patch('/:id', async (req, res) => {
  try {
    const item = await StockItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── DELETE /api/stock/:id — supprimer un article ─────────────────
router.delete('/:id', async (req, res) => {
  try {
    await StockItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/stock/:id/movement — ajouter un mouvement ─────────
router.post('/:id/movement', async (req, res) => {
  try {
    const { type, quantity, reason } = req.body;
    const item = await StockItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Article non trouvé' });

    // mettre à jour la quantité
    if (type === 'in')         item.quantity += quantity;
    else if (type === 'out')   item.quantity = Math.max(0, item.quantity - quantity);
    else if (type === 'adjustment') item.quantity = quantity;

    await item.save();

    // enregistrer le mouvement
    const movement = await StockMovement.create({
      stockItem: item._id,
      type, quantity, reason
    });

    res.json({ item, movement });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── GET /api/stock/:id/history — historique d'un article ────────
router.get('/:id/history', async (req, res) => {
  try {
    const history = await StockMovement.find({ stockItem: req.params.id }).sort({ createdAt: -1 }).limit(50);
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;