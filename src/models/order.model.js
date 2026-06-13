const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  name:     { type: String, required: true },
  emoji:    { type: String },
  price:    { type: Number, required: true },
  quantity: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  selectedOptions: { type: Object, default: {} },
});

const orderSchema = new mongoose.Schema({
  orderNumber:  { type: String, unique: true },
  table:        { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
  tableNumber:  { type: Number, required: true },
  items:        [orderItemSchema],
  total:        { type: Number, required: true },
  note:         { type: String },
  status: {
    type:    String,
    enum:    ['pending', 'preparing', 'ready', 'delivered', 'cancelled', 'billed'],
    default: 'pending',
  },
}, { timestamps: true });

orderSchema.pre('save', async function () {
  if (!this.orderNumber) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `CMD-${String(count + 1).padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('Order', orderSchema);