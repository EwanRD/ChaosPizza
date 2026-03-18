const pizza = require("../pizza");
const db = require("../database");

beforeAll((done) => {
  // ensure DB seeded
  db.get("SELECT COUNT(*) as count FROM pizzas", (err, row) => done());
});

test("getPizzaPrice returns known and unknown prices", () => {
  expect(pizza.getPizzaPrice(1)).toBe(10);
  expect(pizza.getPizzaPrice(99999)).toBe(0);
});
