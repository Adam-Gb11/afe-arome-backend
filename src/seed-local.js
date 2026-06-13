require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./models/user.model');
const MenuItem = require('./models/menuItem.model');
const Table    = require('./models/table.model');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI_LOCAL);
  console.log('🌱 Seeding base locale...');

  await User.deleteMany({});
  await MenuItem.deleteMany({});
  await Table.deleteMany({});

  await User.create({ name: 'Admin Café', email: 'admin@the-elo.tn', password: 'Admin1234!', role: 'admin' });
  await User.create({ name: 'Gérant Café', email: 'gerant@the-elo.tn', password: 'Gerant1234!', role: 'staff' });
  console.log('✅ Utilisateurs créés');

  await MenuItem.insertMany([
    { name: 'Espresso',        price: 1.8,  category: 'cafe',      emoji: '☕', available: true },
    { name: 'Cappuccino',      price: 3.2,  category: 'cafe',      emoji: '🍵', available: true },
    { name: 'Latte Macchiato', price: 3.5,  category: 'cafe',      emoji: '🥛', available: true },
    { name: 'Cold Brew',       price: 4.0,  category: 'cafe',      emoji: '🧋', available: true },
    { name: 'Matcha Latte',    price: 4.2,  category: 'cafe',      emoji: '🌿', available: true },
    { name: 'Jus d\'Orange',   price: 3.5,  category: 'boisson',   emoji: '🍊', available: true },
    { name: 'Limonade Menthe', price: 3.2,  category: 'boisson',   emoji: '🍋', available: true },
    { name: 'Thé Menthe',      price: 2.5,  category: 'boisson',   emoji: '🫖', available: true },
    { name: 'Smoothie',        price: 4.5,  category: 'boisson',   emoji: '🫐', available: true },
    { name: 'Eau Minérale',    price: 1.5,  category: 'boisson',   emoji: '💧', available: true },
    { name: 'Croissant',       price: 2.2,  category: 'patisserie',emoji: '🥐', available: true },
    { name: 'Waffle',          price: 5.5,  category: 'patisserie',emoji: '🧇', available: true },
    { name: 'Muffin Noisette', price: 3.8,  category: 'patisserie',emoji: '🧁', available: true },
    { name: 'Salade César',    price: 9.5,  category: 'plat',      emoji: '🥗', available: true },
    { name: 'Club Sandwich',   price: 8.0,  category: 'plat',      emoji: '🥪', available: true },
    { name: 'Eggs Benedict',   price: 10.5, category: 'plat',      emoji: '🍳', available: true },
    { name: 'Cheesecake',      price: 5.5,  category: 'dessert',   emoji: '🍰', available: true },
    { name: 'Fondant Choco',   price: 6.0,  category: 'dessert',   emoji: '🍫', available: true },
    { name: 'Margherita',      price: 10.0, category: 'pizza',     emoji: '🍕', available: true },
    { name: 'Poulet BBQ',      price: 13.0, category: 'pizza',     emoji: '🍗', available: true },
  ]);
  console.log('✅ 20 articles créés');

  await Table.insertMany(Array.from({ length: 20 }, (_, i) => ({ number: i+1, capacity: i < 10 ? 2 : 4 })));
  console.log('✅ 20 tables créées');

  console.log('🎉 Base locale prête !');
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });