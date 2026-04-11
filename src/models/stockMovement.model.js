const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  stockItem:  { type: mongoose.Schema.Types.ObjectId, ref: 'StockItem', required: true },
  type:       { type: String, enum: ['in', 'out', 'adjustment'], required: true },
  quantity:   { type: Number, required: true },
  reason:     { type: String, default: '' }, // ex: "livraison", "commande CMD-0001", "perte"
  orderId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
  createdBy:  { type: String, default: 'admin' },
}, { timestamps: true });

module.exports = mongoose.model('StockMovement', stockMovementSchema);