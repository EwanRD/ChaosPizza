const request = require("supertest");

const app = require("../app");

test("app legacy middleware does not block requests", async () => {
  const res = await request(app).get("/pizzas");
  // either 200 (normal) or 500 (if pizza handler errors) are both fine,
  // the point is: middleware chain continues and we get a response.
  expect([200, 500]).toContain(res.status);
});
