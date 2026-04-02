const pizza = require("../pizza");
const db = require("../database");

beforeAll((done) => {
  db.get("SELECT COUNT(*) as count FROM pizzas", () => {
    const start = Date.now();
    const tick = () => {
      if (pizza.getPizzaPrice(1) === 10) return done();
      if (Date.now() - start > 500) return done();
      setTimeout(tick, 10);
    };
    tick();
  });
});

test("getPizzaPrice returns known and unknown prices", () => {
  expect(pizza.getPizzaPrice(1)).toBe(10);
  expect(pizza.getPizzaPrice(99999)).toBe(0);
});
