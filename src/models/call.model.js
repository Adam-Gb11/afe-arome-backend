const mongoose = require('mongoose');

const callSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true },
  status:      { type: String, enum: ['pending', 'answered'], default: 'pending' },
  createdAt:   { type: Date, default: Date.now },
});

module.exports = mongoose.model('Call', callSchema);