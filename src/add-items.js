require('dotenv').config();
const mongoose = require('mongoose');
const MenuItem = require('./models/menuItem.model');

async function addItems() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('➕ Ajout des nouveaux articles...');

  await MenuItem.insertMany([
    // Thés
    { name: 'Thé Vert',        description: 'Thé vert japonais sencha',              price: 2.5,  category: 'the',    emoji: '🍵', sortOrder: 1 },
    { name: 'Thé Menthe',      description: 'Menthe fraîche, sucre au choix',        price: 2.5,  category: 'the',    emoji: '🫖', sortOrder: 2 },
    { name: 'Thé Chai',        description: 'Épices, lait, miel',                    price: 3.0,  category: 'the',    emoji: '🍂', sortOrder: 3 },
    { name: 'Thé Rouge',       description: 'Rooibos, vanille',                      price: 2.8,  category: 'the',    emoji: '🌹', sortOrder: 4 },
    // Crêpes
    { name: 'Crêpe Nutella',   description: 'Nutella, banane, chantilly',            price: 4.5,  category: 'crepe',  emoji: '🥞', sortOrder: 1, badge: 'popular' },
    { name: 'Crêpe Citron',    description: 'Citron frais, sucre glace',             price: 3.5,  category: 'crepe',  emoji: '🍋', sortOrder: 2 },
    { name: 'Crêpe Fromage',   description: 'Fromage fondu, jambon, champignons',    price: 5.0,  category: 'crepe',  emoji: '🧀', sortOrder: 3 },
    { name: 'Crêpe Poulet',    description: 'Poulet grillé, fromage, sauce maison',  price: 5.5,  category: 'crepe',  emoji: '🍗', sortOrder: 4 },
    // Burgers
    { name: 'Classic Burger',  description: 'Bœuf, cheddar, salade, tomate',        price: 9.0,  category: 'burger', emoji: '🍔', sortOrder: 1 },
    { name: 'Chicken Burger',  description: 'Poulet croustillant, mayo, pickles',    price: 8.5,  category: 'burger', emoji: '🍗', sortOrder: 2, badge: 'popular' },
    { name: 'Double Burger',   description: 'Double steak, double cheddar',          price: 12.0, category: 'burger', emoji: '🥩', sortOrder: 3, badge: 'chef' },
    { name: 'Veggie Burger',   description: 'Galette légumes, avocat, houmous',      price: 8.0,  category: 'burger', emoji: '🥑', sortOrder: 4 },
    // Pizzas
    { name: 'Margherita',      description: 'Tomate, mozzarella, basilic',           price: 10.0, category: 'pizza',  emoji: '🍕', sortOrder: 1 },
    { name: 'Quatre Fromages', description: 'Mozzarella, chèvre, gorgonzola, emmental', price: 12.0, category: 'pizza', emoji: '🧀', sortOrder: 2 },
    { name: 'Poulet BBQ',      description: 'Poulet grillé, sauce BBQ, oignons',     price: 13.0, category: 'pizza',  emoji: '🍗', sortOrder: 3, badge: 'popular' },
    { name: 'Végétarienne',    description: 'Légumes grillés, pesto, mozzarella',    price: 11.0, category: 'pizza',  emoji: '🌿', sortOrder: 4 },
  ]);

  console.log('✅ 16 nouveaux articles ajoutés !');
  await mongoose.disconnect();
}

addItems().catch(err => {
  console.error(err);
  process.exit(1);
});