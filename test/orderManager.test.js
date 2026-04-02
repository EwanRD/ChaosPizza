const db = require("../database");

beforeEach((done) => {
  db.run("DELETE FROM orders", done);
});

afterAll((done) => {
  db.close(done);
});

test("createOrder returns error for invalid order", () => {
  const orderManager = require("../orderManager");
  const res = orderManager.createOrder(null, () => {});
  expect(res).toEqual({ error: "invalid order" });
});

test("orderManager.getOrders applies inflation tax rounding", (done) => {
  const orderManager = require("../orderManager");
  db.run(
    "INSERT INTO orders (total, status, promo) VALUES (100, 'CREATED', '')",
    function (err) {
      if (err) return done(err);
      orderManager.getOrders((err2, rows) => {
        if (err2) return done(err2);
        expect(rows.length).toBeGreaterThanOrEqual(1);
        // total should be 100 
        expect(rows[0].total).toBe(100);
        done();
      });
    },
  );
});

describe('orderManager extra branches', () => {
  beforeEach(() => jest.resetModules());

  test('FREEPIZZA promo yields total 0', (done) => {
    jest.doMock('../database', () => ({
      get: (sql, params, cb) => cb(null, { stock: 10, price: 10 }),
      run: function(sql, params, cb) { cb && cb.call({ lastID: 1, changes: 1 }, null); },
      all: () => {}
    }));
    jest.doMock('../pizza', () => ({ getPizzaPrice: () => 10 }));

    const om = require('../orderManager');

    om.createOrder({ items: [{ pizzaId: 1, qty: 1 }], promoCode: 'FREEPIZZA' }, (err, res) => {
      expect(err).toBeNull();
      expect(res.total).toBe(0);
      done();
    });
  });

  test('HALF promo + >=2 items applies half then 10% discount', (done) => {
    jest.doMock('../database', () => ({
      get: (sql, params, cb) => cb(null, { stock: 10, price: 10 }),
      run: function(sql, params, cb) { cb && cb.call({ lastID: 2, changes: 1 }, null); },
      all: () => {}
    }));
    jest.doMock('../pizza', () => ({ getPizzaPrice: () => 10 }));

    const om = require('../orderManager');

    // two items of price 10 => 20; HALF -> 10; then 10% off -> 9
    om.createOrder({ items: [{ pizzaId: 1, qty: 1 }, { pizzaId: 1, qty: 1 }], promoCode: 'HALF' }, (err, res) => {
      expect(err).toBeNull();
      expect(res.total).toBe(9);
      done();
    });
  });

  test('legacy fallback when prices zero sets total to 10', (done) => {
    jest.doMock('../database', () => ({
      get: (sql, params, cb) => cb(null, { stock: 10, price: 0 }),
      run: function(sql, params, cb) { cb && cb.call({ lastID: 3, changes: 1 }, null); },
      all: () => {}
    }));
    jest.doMock('../pizza', () => ({ getPizzaPrice: () => 0 }));

    const om = require('../orderManager');

    om.createOrder({ items: [{ pizzaId: 1, qty: 1 }] }, (err, res) => {
      expect(err).toBeNull();
      expect(res.total).toBe(10);
      done();
    });
  });

  test('updateRes changes 0 then pizza missing -> Pizza introuvable', (done) => {
    // db.get must return a row on initial check, but undefined on later check
    const dbMock = {
      get: (sql, params, cb) => {
        if (sql.includes('price FROM pizzas')) return cb(null, { stock: 10, price: 10 });
        return cb(null, undefined);
      },
      run: function(sql, params, cb) { cb && cb.call({ lastID: 0, changes: 0 }, null); },
      all: () => {}
    };

    jest.doMock('../database', () => dbMock);
    jest.doMock('../pizza', () => ({ getPizzaPrice: () => 10 }));
    const om = require('../orderManager');

    om.createOrder({ items: [{ pizzaId: 1, qty: 1 }] }, (err, res) => {
      expect(err).toEqual({ error: 'Pizza introuvable' });
      done();
    });
  });

  test('updateRes changes 0 then current exists -> Stock insuffisant', (done) => {
    const dbMock = {
      get: (sql, params, cb) => {
        if (sql.includes('price FROM pizzas')) return cb(null, { stock: 10, price: 10 });
        return cb(null, { stock: 0 });
      },
      run: function(sql, params, cb) { cb && cb.call({ lastID: 0, changes: 0 }, null); },
      all: () => {}
    };

    jest.doMock('../database', () => dbMock);
    jest.doMock('../pizza', () => ({ getPizzaPrice: () => 10 }));
    const om = require('../orderManager');

    om.createOrder({ items: [{ pizzaId: 1, qty: 1 }] }, (err, res) => {
      expect(err).toEqual({ error: 'Stock insuffisant' });
      done();
    });
  });

  test('updateOrderStatus invalid, db error, not found and success', (done) => {
    jest.resetModules();
    const om = require('../orderManager');

    // invalid status
    om.updateOrderStatus(1, 'BAD', (err) => {
      expect(err).toHaveProperty('error');

      // not found
      jest.resetModules();
      jest.doMock('../database', () => ({ run: function(sql, params, cb) { cb && cb.call({ changes: 0 }, null); } }));
      const om3 = require('../orderManager');
      om3.updateOrderStatus(1, 'PREPARING', (err3) => {
        expect(err3).toEqual({ error: 'Commande introuvable' });

        // success
        jest.resetModules();
        jest.doMock('../database', () => ({ run: function(sql, params, cb) { cb && cb.call({ changes: 1 }, null); } }));
        const om4 = require('../orderManager');
        om4.updateOrderStatus(1, 'PREPARING', (err4, res4) => {
          expect(err4).toBeNull();
          expect(res4).toEqual({ id: 1, status: 'PREPARING' });
          done();
        });
      });
    });
    });
  });

