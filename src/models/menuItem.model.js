const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  choices:  [{
    label: { type: String, required: true },
    price: { type: Number, default: 0 }
  }],
  required: { type: Boolean, default: false },
}, { _id: false });

const menuItemSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String },
  price:       { type: Number, required: true },
 category: { 
  type: String, 
  enum: ['cafe', 'boisson', 'patisserie', 'plat', 'dessert', 'crepe', 'pizza', 'burger', 'the']
},
  emoji:       { type: String, default: '🍽️' },
  image:       { type: String, default: null },
  badge:       { type: String, enum: ['popular', 'new', 'chef', null], default: null },
  available:   { type: Boolean, default: true },
  sortOrder:   { type: Number, default: 0 },
  options:     [optionSchema],
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);