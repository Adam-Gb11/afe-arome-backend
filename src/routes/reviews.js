const router = require('express').Router();
const Review = require('../models/review.model');

// GET /api/reviews — tous les avis
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/reviews — ajouter un avis
router.post('/', async (req, res) => {
  try {
    const review = await Review.create(req.body);
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/reviews/stats — statistiques
router.get('/stats', async (req, res) => {
  try {
    const reviews = await Review.find();
    const total   = reviews.length;
    const avg     = total ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
    const dist    = [1,2,3,4,5].map(n => ({
      rating: n,
      count:  reviews.filter(r => r.rating === n).length
    }));
    res.json({ total, avg, dist });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;