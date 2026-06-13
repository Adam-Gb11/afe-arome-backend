const router    = require('express').Router();
const Order     = require('../models/order.model');
const MenuItem  = require('../models/menuItem.model');
const Table     = require('../models/table.model');
const StockItem = require('../models/stockItem.model');
const StockMovement = require('../models/stockMovement.model');
const { routeOrderToPrinters } = require('../services/printer.service');

// POST /api/orders
router.post('/', async (req, res) => {
  try {
    const { tableNumber, items, note } = req.body;
    const table = await Table.findOne({ number: Number(tableNumber) });
    if (!table) return res.status(400).json({ message: `Table ${tableNumber} non trouvée` });

    const enriched = [];
    let total = 0;

    for (const i of items) {
  const menuItem = await MenuItem.findById(i.menuItemId);
  if (!menuItem) return res.status(400).json({ message: `Article ${i.menuItemId} non trouvé` });
  const unitPrice = i.price || menuItem.price; // ← utilise le prix avec options
  const subtotal = unitPrice * i.quantity;
  total += subtotal;
  enriched.push({
    menuItem:        menuItem._id,
    name:            menuItem.name,
    emoji:           menuItem.emoji,
    price:           unitPrice,
    quantity:        i.quantity,
    subtotal,
    selectedOptions: i.selectedOptions || {}, // ← ajoute ça
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
    routeOrderToPrinters(order).catch(err =>
      console.error('❌ Erreur impression:', err.message)
    );

    res.status(201).json(order);
  } catch (err) {
    console.error('❌ Erreur:', err.message);
    res.status(400).json({ message: err.message });
  }
});

// GET /api/orders/bestsellers — AVANT /:id
router.get('/bestsellers', async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const orders = await Order.find({
      createdAt: { $gte: oneWeekAgo },
      status: { $in: ['delivered', 'billed'] }
    });

    const itemCount = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const id = item.menuItem?.toString() || item.name;
        if (!itemCount[id]) {
          itemCount[id] = { menuItemId: id, name: item.name, emoji: item.emoji, count: 0 };
        }
        itemCount[id].count += item.quantity;
      });
    });

    const sorted = Object.values(itemCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    res.json(sorted);
  } catch (err) {
    res.status(500).json({ message: err.message });
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

    if (status === 'preparing' && order.status === 'pending') {
      for (const orderItem of order.items) {
        const stockItems = await StockItem.find({ menuItems: orderItem.menuItem });
        for (const stockItem of stockItems) {
          const qtyToDeduct = stockItem.quantityPerOrder * orderItem.quantity;
          if (qtyToDeduct <= 0) continue;
          stockItem.quantity = Math.max(0, stockItem.quantity - qtyToDeduct);
          await stockItem.save();
          await StockMovement.create({
            stockItem:  stockItem._id,
            type:       'out',
            quantity:   qtyToDeduct,
            reason:     `Commande ${order.orderNumber} — ${orderItem.name}`,
            orderId:    order._id,
            createdBy:  'system',
          });
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

// DELETE /api/orders/:id
router.delete('/:id', async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: 'Commande supprimée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;