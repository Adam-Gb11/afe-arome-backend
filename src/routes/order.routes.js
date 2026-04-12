const router    = require('express').Router();
const Order     = require('../models/order.model');
const MenuItem  = require('../models/menuItem.model');
const Table     = require('../models/table.model');
const StockItem = require('../models/stockItem.model');
const StockMovement = require('../models/stockMovement.model');

// POST /api/orders
router.post('/', async (req, res) => {
  try {
    console.log('📦 Body reçu:', req.body);
    
    const { tableNumber, items, note } = req.body;

    const table = await Table.findOne({ number: Number(tableNumber) });
    console.log('🪑 Table trouvée:', table);
    
    if (!table) return res.status(400).json({ message: `Table ${tableNumber} non trouvée` });

    const enriched = [];
    let total = 0;

    for (const i of items) {
      console.log('🍽️ Article:', i);
      const menuItem = await MenuItem.findById(i.menuItemId);
      if (!menuItem) return res.status(400).json({ message: `Article ${i.menuItemId} non trouvé` });
      const subtotal = menuItem.price * i.quantity;
      total += subtotal;
      enriched.push({
        menuItem: menuItem._id,
        name:     menuItem.name,
        emoji:    menuItem.emoji,
        price:    menuItem.price,
        quantity: i.quantity,
        subtotal,
      });
    }

    const order = await Order.create({
      table:       table._id,
      tableNumber: Number(tableNumber),
      items:       enriched,
      total,
      note: note || '',
    });

    console.log('✅ Commande créée:', order.orderNumber);
    res.status(201).json(order);
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    res.status(400).json({ message: err.message });
  }
});

// GET /api/orders
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    
    if (req.query.date) {
      const start = new Date(req.query.date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(req.query.date);
      end.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: start, $lte: end };
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/orders/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Commande non trouvée' });

    // ── Déduction automatique du stock quand "preparing" ──────────
    if (status === 'preparing' && order.status === 'pending') {
      for (const orderItem of order.items) {
        // chercher les articles de stock liés à ce menuItem
        const stockItems = await StockItem.find({
          menuItems: orderItem.menuItem
        });

        for (const stockItem of stockItems) {
          const qtyToDeduct = stockItem.quantityPerOrder * orderItem.quantity;
          if (qtyToDeduct <= 0) continue;

          // déduire la quantité
          stockItem.quantity = Math.max(0, stockItem.quantity - qtyToDeduct);
          await stockItem.save();

          // enregistrer le mouvement
          await StockMovement.create({
            stockItem:  stockItem._id,
            type:       'out',
            quantity:   qtyToDeduct,
            reason:     `Commande ${order.orderNumber} — ${orderItem.name}`,
            orderId:    order._id,
            createdBy:  'system',
          });

          console.log(`📉 Stock déduit: ${stockItem.name} -${qtyToDeduct} ${stockItem.unit}`);
        }
      }
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;