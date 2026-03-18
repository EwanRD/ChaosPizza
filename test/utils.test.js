jest.mock("../pizza");
const pizza = require("../pizza");
const utils = require("../utils");
const db = require("../database");

beforeEach((done) => {
  db.run("DELETE FROM orders", done);
});

test("round and formatPrice", () => {
  expect(utils.round()).toBe(0);
  expect(utils.round(1.234)).toBe(1.23);
  expect(utils.formatPrice(5)).toBe("5€");
});

test("calculateOrderTotalLegacy handles edge cases and computes totals", () => {
  expect(utils.calculateOrderTotalLegacy(null)).toBe(0);

  pizza.getPizzaPrice.mockReturnValue(10);
  const order = { items: [{ pizzaId: 1, qty: 2 }] };
  expect(utils.calculateOrderTotalLegacy(order)).toBe(20);

  const badOrder = { items: [{ qty: 2 }, null] };
  expect(utils.calculateOrderTotalLegacy(badOrder)).toBe(0);
});
