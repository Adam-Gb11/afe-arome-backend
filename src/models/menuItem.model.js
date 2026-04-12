const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String },
  price:       { type: Number, required: true },
  category:    { 
    type: String, 
    enum: ['cafe', 'boisson', 'patisserie', 'plat', 'dessert'] 
  },
  emoji:       { type: String, default: '🍽️' },
  badge:       { type: String, enum: ['popular', 'new', 'chef', null], default: null },
  available:   { type: Boolean, default: true },
  sortOrder:   { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);