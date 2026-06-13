const router   = require('express').Router();
const MenuItem = require('../models/menuItem.model');
const { upload } = require('../config/cloudinary');

// GET /api/menu
router.get('/', async (req, res) => {
  try {
    const filter = req.query.all === 'true' ? {} : { available: true };
    const items = await MenuItem.find(filter).sort({ category: 1, sortOrder: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/menu/:id
router.get('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Article non trouvé' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/menu — avec image
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file?.path) data.image = req.file.path;
    const item = await MenuItem.create(data);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/menu/:id — avec image
router.patch('/:id', upload.single('image'), async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file?.path) data.image = req.file.path;
    const item = await MenuItem.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!item) return res.status(404).json({ message: 'Article non trouvé' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/menu/:id
router.delete('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Article non trouvé' });
    res.json({ message: 'Article supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;