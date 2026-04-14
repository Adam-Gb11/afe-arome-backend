const mongoose = require('mongoose');

const stockMovementSchema = new mongoose.Schema({
  stockItem:  { type: mongoose.Schema.Types.ObjectId, ref: 'StockItem', required: true },
  type:       { type: String, enum: ['in', 'out', 'adjustment'], required: true },
  quantity:   { type: Number, required: true },
  unitCost:   { type: Number, default: 0 },
  totalCost:  { type: Number, default: 0 },
  reason:     { type: String, default: '' },
  orderId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
  createdBy:  { type: String, default: 'admin' },
  factureUrl: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('StockMovement', stockMovementSchema);