require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const morgan    = require('morgan');
const connectDB = require('./config/db');
const { fullSync, syncToAtlas, isAtlasAvailable } = require('./services/sync.service');

const app = express();

connectDB().then(async () => {
  try {
    const atlasOk = await isAtlasAvailable();
    if (atlasOk) {
      console.log('🔄 Atlas disponible — sync en cours...');
      await fullSync();
    } else {
      console.log('📡 Mode local — pas de sync (Atlas indisponible)');
    }
  } catch (err) {
    console.warn('⚠️ Sync ignorée:', err.message);
  }
});

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(morgan('dev'));

// routes
app.use('/api/menu',      require('./routes/menu.routes'));
app.use('/api/orders',    require('./routes/order.routes'));
app.use('/api/reviews',   require('./routes/reviews'));
app.use('/api/calls',     require('./routes/calls'));
app.use('/api/tables',    require('./routes/table.routes'));
app.use('/api/auth',      require('./routes/auth.routes'));
app.use('/api/stock',     require('./routes/stock.routes'));
app.use('/api/suppliers', require('./routes/supplier.routes'));
app.use('/api/caisse',    require('./routes/caisse.routes'));

// ── Route sync manuelle ────────────────────────────────────────
app.post('/api/sync', async (req, res) => {
  try {
    const result = await fullSync();
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/sync/status', async (req, res) => {
  const atlasOk = await isAtlasAvailable();
  res.json({ atlasAvailable: atlasOk, mode: atlasOk ? 'online' : 'local' });
});

app.get('/api/health', (_, res) => res.json({ status: 'OK', cafe: 'THE ELO' }));
app.use((_, res) => res.status(404).json({ message: 'Route not found' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

// ── Sync automatique toutes les 5 minutes si Atlas disponible ──
setInterval(async () => {
  const atlasOk = await isAtlasAvailable();
  if (atlasOk) {
    console.log('⏰ Sync automatique...');
    await syncToAtlas();
  }
}, 5 * 60 * 1000);