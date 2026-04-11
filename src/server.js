require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const morgan    = require('morgan');
const connectDB = require('./config/db');

const app = express();

// connexion MongoDB
connectDB();

// middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(morgan('dev'));

// routes existantes
app.use('/api/menu',      require('./routes/menu.routes'));
app.use('/api/orders',    require('./routes/order.routes'));
app.use('/api/reviews',   require('./routes/reviews'));
app.use('/api/calls',     require('./routes/calls'));
app.use('/api/tables',    require('./routes/table.routes'));
app.use('/api/auth',      require('./routes/auth.routes'));

// nouvelles routes stock
app.use('/api/stock',     require('./routes/stock.routes'));
app.use('/api/suppliers', require('./routes/supplier.routes'));

// test
app.get('/api/health', (_, res) => res.json({ status: 'OK', cafe: 'THE ELO' }));

// erreur 404
app.use((_, res) => res.status(404).json({ message: 'Route not found' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);