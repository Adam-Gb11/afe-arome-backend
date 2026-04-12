const router   = require('express').Router();
const MenuItem = require('../models/menuItem.model');

// GET /api/menu — récupérer tous les articles (admin: tous, client: disponibles)
router.get('/', async (req, res) => {
  try {
    const filter = req.query.all === 'true' ? {} : { available: true };
    const items = await MenuItem.find(filter)
      .sort({ category: 1, sortOrder: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/menu/:id — récupérer un article
router.get('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Article non trouvé' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/menu — créer un article
router.post('/', async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/menu/:id — modifier un article
router.patch('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(
      req.params.id, req.body, { new: true }
    );
    if (!item) return res.status(404).json({ message: 'Article non trouvé' });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/menu/:id — supprimer un article
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