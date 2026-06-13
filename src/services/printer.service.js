const net = require('net');

// ── Configuration des imprimantes ─────────────────────────────
const PRINTERS = {
  chef:        { ip: '192.168.1.101', port: 9100, name: 'Chef' },
  chicha:      { ip: '192.168.1.102', port: 9100, name: 'Chicha' },
  coitiriste:  { ip: '192.168.1.87', port: 9100, name: 'Coitiriste' },
  serveur:     { ip: '192.168.1.104', port: 9100, name: 'Serveur' },
};

// ── Routing des catégories vers les imprimantes ────────────────
const CATEGORY_PRINTER = {
  // Chef
  'plat':       'chef',
  'pizza':      'chef',
  'burger':     'chef',
  'sandwich':   'chef',
  'tacos':      'chef',
  'crepe':      'chef',
  // Chicha
  'chicha':     'chicha',
  // Coitiriste
  'cafe':       'coitiriste',
  'boisson':    'coitiriste',
  'mojito':     'coitiriste',
  'the':        'coitiriste',
  'patisserie': 'coitiriste',
  'dessert':    'coitiriste',
};

// ── Commandes ESC/POS ──────────────────────────────────────────
const ESC = '\x1B';
const GS  = '\x1D';
const INIT          = ESC + '@';
const BOLD_ON       = ESC + 'E\x01';
const BOLD_OFF      = ESC + 'E\x00';
const CENTER        = ESC + 'a\x01';
const LEFT          = ESC + 'a\x00';
const DOUBLE_SIZE   = GS  + '!\x11';
const NORMAL_SIZE   = GS  + '!\x00';
const CUT           = GS  + 'V\x41\x00';
const FEED          = ESC + 'd\x04';

// ── Formater le ticket ESC/POS ─────────────────────────────────
function formatTicket(order, items, printerName) {
  const now = new Date().toLocaleString('fr-TN', { 
    timeZone: 'Africa/Tunis',
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  let ticket = '';
  ticket += INIT;
  ticket += CENTER;
  ticket += DOUBLE_SIZE;
  ticket += BOLD_ON;
  ticket += 'THE ELO\n';
  ticket += NORMAL_SIZE;
  ticket += 'Cafe-Resto\n';
  ticket += BOLD_OFF;
  ticket += '================================\n';
  ticket += LEFT;
  ticket += BOLD_ON;
  ticket += `Poste   : ${printerName}\n`;
  ticket += BOLD_OFF;
  ticket += `Commande: ${order.orderNumber}\n`;
  ticket += BOLD_ON;
  ticket += `TABLE   : ${order.tableNumber}\n`;
  ticket += BOLD_OFF;
  ticket += `Heure   : ${now}\n`;
  ticket += '================================\n\n';

  for (const item of items) {
    ticket += BOLD_ON;
    ticket += `${item.quantity}x  ${item.name}\n`;
    ticket += BOLD_OFF;
  }

  ticket += '\n';

  if (order.note) {
    ticket += '--------------------------------\n';
    ticket += BOLD_ON;
    ticket += `NOTE: ${order.note}\n`;
    ticket += BOLD_OFF;
  }

  ticket += '================================\n';
  ticket += FEED;
  ticket += CUT;

  return ticket;
}

// ── Envoyer le ticket à l'imprimante via TCP ───────────────────
function printTicket(printer, ticket) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();

    const timeout = setTimeout(() => {
      client.destroy();
      reject(new Error(`Timeout imprimante ${printer.name} (${printer.ip})`));
    }, 5000);

    client.connect(printer.port, printer.ip, () => {
      client.write(Buffer.from(ticket, 'binary'), () => {
        clearTimeout(timeout);
        client.destroy();
        resolve();
        console.log(`🖨️  Ticket envoyé → ${printer.name} (${printer.ip})`);
      });
    });

    client.on('error', (err) => {
      clearTimeout(timeout);
      client.destroy();
      reject(err);
    });
  });
}

// ── Router la commande vers les bonnes imprimantes ─────────────
async function routeOrderToPrinters(order) {
  const groups = {};

  for (const item of order.items) {
    const MenuItem = require('../models/menuItem.model');
    const menuItem = await MenuItem.findById(item.menuItem);
    if (!menuItem) continue;

    const cat = menuItem.category?.toLowerCase() || '';
    const printerKey = CATEGORY_PRINTER[cat] || 'chef';

    if (!groups[printerKey]) groups[printerKey] = [];
    groups[printerKey].push(item);
  }

  for (const [printerKey, items] of Object.entries(groups)) {
    const printer = PRINTERS[printerKey];
    if (!printer) continue;

    const ticket = formatTicket(order, items, printer.name);

    try {
      await printTicket(printer, ticket);
    } catch (err) {
      console.error(`❌ Erreur impression ${printer.name}:`, err.message);
    }
  }
}

module.exports = { routeOrderToPrinters, PRINTERS, CATEGORY_PRINTER };