const request = require('supertest');

describe('lightweight extra coverage tests', () => {
  test('config exposes defaults', () => {
    const config = require('../config');
    expect(config).toHaveProperty('DEFAULT_PIZZA_PRICE');
    expect(config).toHaveProperty('ENABLE_LOGS');
  });

  test('index calls listen on app', () => {
    jest.resetModules();
    const listenMock = jest.fn((port, cb) => cb && cb());
    jest.doMock('../app', () => ({ listen: listenMock }));
    require('../index');
    expect(listenMock).toHaveBeenCalledWith(3000, expect.any(Function));
  });

  test('server /health returns ok', async () => {
    const app = require('../server');
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.text).toBe('ok');
  });

  describe('orderManager branches', () => {
    beforeEach(() => jest.resetModules());

    test('createOrder invalid payload', (done) => {
      const om = require('../orderManager');
      om.createOrder(null, (err, res) => {
        expect(err).toEqual({ error: 'Commande invalide : aucun article' });
        done();
      });
    });

    test('createOrder pizza introuvable', (done) => {
      jest.doMock('../database', () => ({
        get: (sql, params, cb) => cb(null, undefined),
        run: (sql, params, cb) => cb && cb.call({ lastID: 0, changes: 0 }, null),
        all: () => {}
      }));
      jest.doMock('../pizza', () => ({ getPizzaPrice: () => 0 }));

      const om = require('../orderManager');
      om.createOrder({ items: [{ pizzaId: 999, qty: 1 }] }, (err, res) => {
        expect(err).toEqual({ error: 'Pizza introuvable' });
        done();
      });
    });

    test('createOrder stock insuffisant', (done) => {
      jest.doMock('../database', () => ({
        get: (sql, params, cb) => cb(null, { stock: 0, price: 10 }),
        run: (sql, params, cb) => cb && cb.call({ lastID: 0, changes: 0 }, null),
        all: () => {}
      }));
      jest.doMock('../pizza', () => ({ getPizzaPrice: () => 10 }));

      const om = require('../orderManager');
      om.createOrder({ items: [{ pizzaId: 1, qty: 2 }] }, (err, res) => {
        expect(err).toEqual({ error: 'Stock insuffisant' });
        done();
      });
    });

    test('createOrder success path', (done) => {
      jest.doMock('../database', () => ({
        get: (sql, params, cb) => cb(null, { stock: 10, price: 10 }),
        run: function(sql, params, cb) {
          // emulate sqlite run callback with `this` providing lastID/changes
          cb && cb.call({ lastID: 77, changes: 1 }, null);
        },
        all: () => {}
      }));
      jest.doMock('../pizza', () => ({ getPizzaPrice: () => 10 }));

      const om = require('../orderManager');
      om.createOrder({ items: [{ pizzaId: 1, qty: 1 }] }, (err, res) => {
        expect(err).toBeNull();
        expect(res).toHaveProperty('id', 77);
        expect(res).toHaveProperty('total');
        expect(res.status).toBe('CREATED');
        done();
      });
    });
  });
});
