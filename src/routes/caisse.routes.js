const router = require('express').Router();
const Order = require('../models/order.model');
const StockMovement = require('../models/stockMovement.model');

// GET /api/caisse?from=2024-01-01&to=2024-12-31
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.from && req.query.to) {
      filter.createdAt = {
        $gte: new Date(req.query.from),
        $lte: new Date(new Date(req.query.to).setHours(23, 59, 59, 999))
      };
    }

    // Entrées = commandes delivered ou billed
    const orders = await Order.find({
      ...filter,
      status: { $in: ['delivered', 'billed'] }
    });
    const entrees = orders.reduce((sum, o) => sum + o.total, 0);

    // Sorties = achats stock (type: 'in' avec totalCost)
    const mouvements = await StockMovement.find({
      ...filter,
      type: 'in'
    }).populate('stockItem', 'name unit');
    const sorties = mouvements.reduce((sum, m) => sum + (m.totalCost || 0), 0);

    res.json({
      entrees,
      sorties,
      net: entrees - sorties,
      transactions: {
        commandes: orders.map(o => ({
          id: o._id,
          numero: o.orderNumber,
          table: o.tableNumber,
          montant: o.total,
          date: o.createdAt,
          type: 'entree'
        })),
        achats: mouvements.map(m => ({
          id: m._id,
          article: m.stockItem?.name,
          quantite: m.quantity,
          montant: m.totalCost || 0,
          date: m.createdAt,
          type: 'sortie'
        }))
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;