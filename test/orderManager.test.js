const orderManager = require("../orderManager");
const db = require("../database");

beforeEach((done) => {
  db.run("DELETE FROM orders", done);
});

afterAll((done) => {
  db.close(done);
});

test("createOrder returns error for invalid order", () => {
  const res = orderManager.createOrder(null, () => {});
  expect(res).toEqual({ error: "invalid order" });
});

test("orderManager.getOrders applies inflation tax rounding", (done) => {
  db.run(
    "INSERT INTO orders (total, status, promo) VALUES (100, 'CREATED', '')",
    function (err) {
      if (err) return done(err);
      orderManager.getOrders((err2, rows) => {
        if (err2) return done(err2);
        expect(rows.length).toBeGreaterThanOrEqual(1);
        // total should be rounded(100 * 1.05) => 105
        expect(rows[0].total).toBe(105);
        done();
      });
    },
  );
});
