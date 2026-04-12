require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const morgan    = require('morgan');
const connectDB = require('./config/db');

const app = express();

connectDB();

// Routes accessibles sans vérification IP
const PUBLIC_ROUTES = ['/api/auth', '/api/health'];

// Middleware IP
app.use((req, res, next) => {
  // Passer les routes publiques
  if (PUBLIC_ROUTES.some(route => req.path.startsWith(route))) {
    return next();
  }

  let ip = req.socket.remoteAddress || '';

  // Normaliser IPv6 → IPv4
  if (ip.startsWith('::ffff:')) {
    ip = ip.slice(7);
  }

  const isLocalhost = ip === '127.0.0.1' || ip === '::1';
  const isCafeWifi  = ip.startsWith('192.168.0.');

  if (!isLocalhost && !isCafeWifi) {
    return res.status(403).json({
      message: 'Connectez-vous au Wi-Fi du café ☕'
    });
  }

  next();
});

// CORS
app.use(cors({
  origin: ['http://localhost:4200', 'http://192.168.0.0/24'],
  credentials: true,
}));

app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/menu',      require('./routes/menu.routes'));
app.use('/api/orders',    require('./routes/order.routes'));
app.use('/api/reviews',   require('./routes/reviews'));
app.use('/api/calls',     require('./routes/calls'));
app.use('/api/tables',    require('./routes/table.routes'));
app.use('/api/auth',      require('./routes/auth.routes'));
app.use('/api/stock',     require('./routes/stock.routes'));
app.use('/api/suppliers', require('./routes/supplier.routes'));

app.get('/api/health', (_, res) => res.json({ status: 'OK', cafe: 'THE ELO' }));

app.use((_, res) => res.status(404).json({ message: 'Route not found' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);