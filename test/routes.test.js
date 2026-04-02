const request = require("supertest");
const express = require("express");

jest.mock("../pizza");
jest.mock("../orderManager");
const pizza = require("../pizza");
const orders = require("../orderManager");
const routes = require("../routes");

const app = express();
app.use(express.json());
app.use("/", routes);

test("GET /pizzas success", async () => {
  pizza.getAllPizzas = jest.fn((cb) =>
    cb(null, [{ id: 1, name: "M", price: 10 }]),
  );
  const res = await request(app).get("/pizzas");
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBeTruthy();
});

test("GET /pizzas error branch", async () => {
  pizza.getAllPizzas = jest.fn((cb) => cb(new Error("fail")));
  const res = await request(app).get("/pizzas");
  expect(res.status).toBe(500);
  expect(res.text).toBe("err");
});

test("POST /orders error branch (validation/manager error)", async () => {
  orders.createOrder = jest.fn((body, cb) => cb({ error: "invalid order" }));
  const res = await request(app).post("/orders").send({});
  expect(res.status).toBe(400);
  expect(res.body).toEqual({ error: "invalid order" });
});

test("GET /orders returns result", async () => {
  orders.getOrders = jest.fn((cb) =>
    cb(null, [{ id: 1, total: 10, status: "CREATED" }]),
  );
  const res = await request(app).get("/orders");
  expect(res.status).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body[0]).toHaveProperty("id", 1);
});
