const router = require('express').Router();
const StockItem     = require('../models/stockItem.model');
const StockMovement = require('../models/stockMovement.model');
const { upload } = require('../config/cloudinary');

// ── GET /api/stock ──────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const items = await StockItem.find().populate('supplier', 'name phone').sort({ name: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/stock/alerts ───────────────────────────────────────
router.get('/alerts', async (req, res) => {
  try {
    const items = await StockItem.find().populate('supplier', 'name phone');
    const low = items.filter(i => i.quantity <= i.minQuantity);
    res.json(low);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/stock ─────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const item = await StockItem.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── PATCH /api/stock/:id ────────────────────────────────────────
router.patch('/:id', async (req, res) => {
  try {
    const item = await StockItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── DELETE /api/stock/:id ───────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    await StockItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/stock/:id/movement — avec upload facture ──────────
router.post('/:id/movement', upload.single('facture'), async (req, res) => {
  try {
    const { type, quantity, reason } = req.body;
    const item = await StockItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Article non trouvé' });

    if (type === 'in')              item.quantity += Number(quantity);
    else if (type === 'out')        item.quantity = Math.max(0, item.quantity - Number(quantity));
    else if (type === 'adjustment') item.quantity = Number(quantity);

    await item.save();

    const movement = await StockMovement.create({
  stockItem:  item._id,
  type,
  quantity:   Number(quantity),
  unitCost:   type === 'in' ? Number(req.body.unitCost || 0) : 0,
  totalCost:  type === 'in' ? Number(quantity) * Number(req.body.unitCost || 0) : 0,
  reason,
  factureUrl: req.file?.path || null,
});

res.json({ item, movement });
} catch (err) {
  res.status(400).json({ message: err.message });
}
});

// ── GET /api/stock/:id/history ──────────────────────────────────
router.get('/:id/history', async (req, res) => {
  try {
    const history = await StockMovement.find({ stockItem: req.params.id }).sort({ createdAt: -1 }).limit(50);
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;