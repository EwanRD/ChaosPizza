const request = require("supertest");
const express = require("express");

jest.mock("../pizza");
const pizza = require("../pizza");
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
