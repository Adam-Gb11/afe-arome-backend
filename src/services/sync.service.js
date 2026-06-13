const mongoose = require('mongoose');
const Order    = require('../models/order.model');
const MenuItem = require('../models/menuItem.model');
const Table    = require('../models/table.model');

const ATLAS_URI = process.env.MONGO_URI;
const LOCAL_URI = process.env.MONGO_URI_LOCAL || 'mongodb://localhost:27017/the-elo';

let atlasConn = null;

// ── Vérifier si Internet disponible via DNS ────────────────────
async function isAtlasAvailable() {
  return new Promise((resolve) => {
    const dns = require('dns');
    dns.lookup('google.com', (err) => {
      if (err) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

// ── Connexion séparée vers Atlas ───────────────────────────────
async function connectAtlas() {
  if (atlasConn && atlasConn.readyState === 1) return atlasConn;
  
  return new Promise((resolve) => {
    const conn = mongoose.createConnection(ATLAS_URI, {
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 4000,
    });

    const timer = setTimeout(() => {
      console.warn('⚠️ Sync: Timeout Atlas');
      resolve(null);
    }, 5000);

    conn.once('connected', () => {
      clearTimeout(timer);
      atlasConn = conn;
      console.log('🔗 Sync: Atlas connecté');
      resolve(conn);
    });

    conn.once('error', (err) => {
      clearTimeout(timer);
      console.warn('⚠️ Sync: Atlas erreur —', err.message);
      atlasConn = null;
      resolve(null);
    });
  });
}

// ── Sync Atlas → Local ─────────────────────────────────────────
async function syncFromAtlas() {
  const conn = await connectAtlas();
  if (!conn) return { success: false, message: 'Atlas indisponible' };

  try {
    const AtlasOrder    = conn.model('Order',    Order.schema);
    const AtlasMenuItem = conn.model('MenuItem', MenuItem.schema);
    const AtlasTable    = conn.model('Table',    Table.schema);

    const atlasMenuItems = await AtlasMenuItem.find({}).lean();
    for (const item of atlasMenuItems) {
      await MenuItem.findOneAndUpdate({ _id: item._id }, item, { upsert: true });
    }
    console.log(`✅ Sync: ${atlasMenuItems.length} articles menu`);

    const atlasTables = await AtlasTable.find({}).lean();
    for (const table of atlasTables) {
      await Table.findOneAndUpdate({ _id: table._id }, table, { upsert: true });
    }
    console.log(`✅ Sync: ${atlasTables.length} tables`);

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const atlasOrders = await AtlasOrder.find({ createdAt: { $gte: since } }).lean();
    for (const order of atlasOrders) {
      await Order.findOneAndUpdate({ _id: order._id }, order, { upsert: true });
    }
    console.log(`✅ Sync: ${atlasOrders.length} commandes depuis Atlas`);

    return { success: true };
  } catch (err) {
    console.error('❌ Sync Atlas→Local:', err.message);
    return { success: false, message: err.message };
  }
}

// ── Sync Local → Atlas ─────────────────────────────────────────
async function syncToAtlas() {
  const conn = await connectAtlas();
  if (!conn) return { success: false, message: 'Atlas indisponible' };

  try {
    const AtlasOrder = conn.model('Order', Order.schema);
    const localOrders = await Order.find({}).lean();
    let synced = 0;

    for (const order of localOrders) {
      const exists = await AtlasOrder.findById(order._id);
      if (!exists) {
        await AtlasOrder.create(order);
        synced++;
        console.log(`📤 Sync: ${order.orderNumber} → Atlas`);
      }
    }

    console.log(`✅ Sync Local→Atlas: ${synced} commandes envoyées`);
    return { success: true, synced };
  } catch (err) {
    console.error('❌ Sync Local→Atlas:', err.message);
    return { success: false, message: err.message };
  }
}

// ── Sync complète ──────────────────────────────────────────────
async function fullSync() {
  console.log('🔄 Sync bidirectionnelle...');
  const toLocal = await syncFromAtlas();
  const toAtlas = await syncToAtlas();
  console.log('✅ Sync terminée');
  return { toLocal, toAtlas };
}

module.exports = { fullSync, syncFromAtlas, syncToAtlas, isAtlasAvailable };