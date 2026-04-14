const router = require('express').Router();
const jwt    = require('jsonwebtoken');
const User   = require('../models/user.model');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // trouver l'utilisateur
    const user = await User.findOne({ email, active: true });
    if (!user) return res.status(401).json({ message: 'Email incorrect' });

    // vérifier le mot de passe
    const ok = await user.matchPassword(password);
    if (!ok) return res.status(401).json({ message: 'Mot de passe incorrect' });

    
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;