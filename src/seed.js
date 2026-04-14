require('dotenv').config();
const mongoose = require('mongoose');
const User     = require('./models/user.model');
const MenuItem = require('./models/menuItem.model');
const Table    = require('./models/table.model');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('🌱 Seeding database...');

  await User.deleteMany({});
  await MenuItem.deleteMany({});
  await Table.deleteMany({});

  // ── Admin ──────────────────────────────────────────────
  await User.create({
    name:     'Admin Café',
    email:    'admin@the-elo.tn',
    password: 'Admin1234!',
    role:     'admin',
  });
  console.log('✅ Admin créé');
  const gerantExists = await User.findOne({ email: 'gerant@the-elo.tn' });
if (!gerantExists) {
  await User.create({
    name:     'Gérant Café',
    email:    'gerant@the-elo.tn',
    password: 'Gerant1234!',
    role:     'staff',
  });
  console.log('✅ Gérant créé');
}

  // ── Menu ───────────────────────────────────────────────
  await MenuItem.insertMany([
    // Cafés
    { name: 'Espresso',        description: 'Simple, double ou ristretto',            price: 1.8,  category: 'cafe',       emoji: '☕', sortOrder: 1 },
    { name: 'Cappuccino',      description: 'Espresso, lait vapeur, mousse veloutée', price: 3.2,  category: 'cafe',       emoji: '🍵', sortOrder: 2 },
    { name: 'Latte Macchiato', description: "Lait texturé, shot d'espresso",          price: 3.5,  category: 'cafe',       emoji: '🥛', sortOrder: 3, badge: 'popular' },
    { name: 'Cold Brew',       description: 'Infusion froide 12h',                    price: 4.0,  category: 'cafe',       emoji: '🧋', sortOrder: 4, badge: 'new' },
    { name: 'Café Viennois',   description: 'Espresso, crème chantilly, cacao',       price: 3.8,  category: 'cafe',       emoji: '🍫', sortOrder: 5 },
    { name: 'Matcha Latte',    description: "Matcha japonais, lait d'amande",         price: 4.2,  category: 'cafe',       emoji: '🌿', sortOrder: 6, badge: 'new' },
    // Boissons
    { name: "Jus d'Orange",    description: 'Pressé à la commande',                   price: 3.5,  category: 'boisson',    emoji: '🍊', sortOrder: 1 },
    { name: 'Limonade Menthe', description: 'Citron frais, menthe maison',            price: 3.2,  category: 'boisson',    emoji: '🍋', sortOrder: 2 },
    { name: 'Thé Menthe',      description: 'Menthe fraîche, sucre au choix',         price: 2.5,  category: 'boisson',    emoji: '🫖', sortOrder: 3 },
    { name: 'Smoothie',        description: 'Myrtilles, banane, yaourt',              price: 4.5,  category: 'boisson',    emoji: '🫐', sortOrder: 4 },
    { name: 'Eau Minérale',    description: '50cl — plate ou gazeuse',                price: 1.5,  category: 'boisson',    emoji: '💧', sortOrder: 5 },
    // Pâtisseries
    { name: 'Croissant',       description: 'Feuilletage pur beurre',                 price: 2.2,  category: 'patisserie', emoji: '🥐', sortOrder: 1 },
    { name: 'Waffle',          description: 'Pâte légère, miel, fruits rouges',       price: 5.5,  category: 'patisserie', emoji: '🧇', sortOrder: 2, badge: 'popular' },
    { name: 'Pain Chocolat',   description: 'Double barre chocolat Valrhona',         price: 2.5,  category: 'patisserie', emoji: '🍩', sortOrder: 3 },
    { name: 'Muffin Noisette', description: 'Cœur coulant praliné',                   price: 3.8,  category: 'patisserie', emoji: '🧁', sortOrder: 4 },
    { name: 'Toast Avocat',    description: 'Pain au levain, avocat, graines',        price: 5.0,  category: 'patisserie', emoji: '🫓', sortOrder: 5 },
    // Plats
    { name: 'Salade César',    description: 'Romaine, parmesan, poulet grillé',       price: 9.5,  category: 'plat',       emoji: '🥗', sortOrder: 1 },
    { name: 'Club Sandwich',   description: 'Poulet, bacon, tomate, mayo maison',     price: 8.0,  category: 'plat',       emoji: '🥪', sortOrder: 2 },
    { name: 'Eggs Benedict',   description: 'Œufs pochés, jambon, hollandaise',       price: 10.5, category: 'plat',       emoji: '🍳', sortOrder: 3, badge: 'chef' },
    { name: 'Pâtes Carbonara', description: 'Pancetta, parmesan, œuf',               price: 11.0, category: 'plat',       emoji: '🍝', sortOrder: 4 },
    // Desserts
    { name: 'Cheesecake',      description: 'Fromage frais, coulis fruits rouges',    price: 5.5,  category: 'dessert',    emoji: '🍰', sortOrder: 1 },
    { name: 'Fondant Choco',   description: 'Cœur coulant, glace vanille',            price: 6.0,  category: 'dessert',    emoji: '🍫', sortOrder: 2, badge: 'popular' },
    { name: 'Crème Brûlée',    description: 'Vanille Tahiti, caramel craquant',       price: 5.0,  category: 'dessert',    emoji: '🍮', sortOrder: 3 },
    { name: 'Coupe Glacée',    description: '3 boules, sauce caramel, chantilly',     price: 5.5,  category: 'dessert',    emoji: '🍨', sortOrder: 4 },
  ]);
  console.log('✅ 24 articles créés');

  // ── Tables ─────────────────────────────────────────────
  const tables = Array.from({ length: 20 }, (_, i) => ({
    number:   i + 1,
    capacity: i < 10 ? 2 : 4
  }));
  await Table.insertMany(tables);
  console.log('✅ 20 tables créées');

  console.log('\n🎉 Base de données prête !');
  console.log('📧 admin@the-elo.tn');
  console.log('🔑 Admin1234!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});