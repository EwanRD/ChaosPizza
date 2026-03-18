const db = require('./database');
const pizza = require('./pizza');
const utils = require('./utils');

let lastOrderId = 0;
const VALID_STATUSES = new Set(['PREPARING', 'DELIVERING', 'DELIVERED']);

// Promisifie db.get et db.run pour utiliser async/await
function dbGet(sql, params = []) {
  return new Promise((resolve, reject) =>
    db.get(sql, params, (err, row) => err ? reject(err) : resolve(row))
  );
}

function dbRun(sql, params = []) {
  return new Promise((resolve, reject) =>
    db.run(sql, params, function(err) { err ? reject(err) : resolve(this); })
  );
}

// Calcule le total à partir des articles de la commande
function computeTotal(order) {
  let total = order.items.reduce((sum, item) =>
    sum + pizza.getPizzaPrice(item.pizzaId) * item.qty, 0
  );

  // Codes promo exclusifs
  if (order.promoCode === 'FREEPIZZA') return 0;
  if (order.promoCode === 'HALF') total /= 2;

  // -10% dès 2 articles
  if (order.items.length >= 2) total *= 0.9;

  // -5€ au-delà de 3 articles
  if (order.items.length > 3) total = Math.max(0, total - 5);

  return total;
}

async function createOrder(order, cb) {
  if (!order?.items?.length) {
    return cb({ error: 'Commande invalide : aucun article' });
  }

  const firstId = order.items[0].pizzaId;
  const qty = order.items.reduce((sum, item) => sum + item.qty, 0);

  try {
    const row = await dbGet('SELECT stock, price FROM pizzas WHERE id = ?', [firstId]);

    if (!row) return cb({ error: 'Pizza introuvable' });
    if (row.stock < qty) return cb({ error: 'Stock insuffisant' });

    const total = computeTotal(order);

    await dbRun('UPDATE pizzas SET stock = ? WHERE id = ?', [row.stock - qty, firstId]);

    const result = await dbRun(
      "INSERT INTO orders (total, status, promo) VALUES (?, 'CREATED', ?)",
      [utils.round(total), order.promoCode ?? null]
    );

    lastOrderId++;
    cb(null, { id: result.lastID, total: utils.round(total), status: 'CREATED' });

  } catch (err) {
    console.error('createOrder error:', err);
    cb({ error: 'Erreur interne' });
  }
}

async function getOrders(cb) {
  try {
    const rows = await dbGet('SELECT * FROM orders', []);
    // Aucune taxe appliquée ici — le total stocké en base est la référence
    cb(null, rows.map(o => ({ ...o, total: utils.round(o.total) })));
  } catch (err) {
    console.error('getOrders error:', err);
    cb(err);
  }
}

function updateOrderStatus(id, status, cb) {
  if (!VALID_STATUSES.has(status)) {
    return cb({ error: 'Statut invalide. Valeurs acceptées : PREPARING, DELIVERING, DELIVERED' });
  }

  db.run(
    'UPDATE orders SET status = ? WHERE id = ?',
    [status, id],
    function(err) {
      if (err) return cb({ error: 'Erreur base de données' });
      if (this.changes === 0) return cb({ error: 'Commande introuvable' });
      cb(null, { id: Number(id), status });
    }
  );
}

module.exports = { createOrder, getOrders, updateOrderStatus };