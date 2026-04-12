const mongoose = require('mongoose');

const stockItemSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  category:    { type: String, enum: ['ingredient', 'equipment','boisson'], required: true },
  unit:        { type: String, required: true }, // kg, litre, pièce, boîte...
  quantity:    { type: Number, required: true, default: 0 },
  minQuantity: { type: Number, required: true, default: 5 }, // seuil alerte
  price:       { type: Number, default: 0 }, // prix unitaire
  supplier:    { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', default: null },
  menuItems:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }], // lien menu
  quantityPerOrder: { type: Number, default: 0 }, // quantité déduite par commande
}, { timestamps: true });

// virtual: est-ce que le stock est bas ?
stockItemSchema.virtual('isLow').get(function () {
  return this.quantity <= this.minQuantity;
});

stockItemSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('StockItem', stockItemSchema);