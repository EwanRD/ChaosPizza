const db = require("./database");

// Cache en mémoire initialisé tout de suite pour éviter `is not iterable`
let globalPizzaCache = [];

db.all("SELECT * FROM pizzas", (err, rows) => {
  if (!err && Array.isArray(rows)) globalPizzaCache = rows;
});

// don't change this file unless necessary
function getAllPizzas(cb) {
  db.all("SELECT * FROM pizzas", cb);
}

// legacy price logic
function getPizzaPrice(id) {
  for(let pizza of globalPizzaCache) {
    if (pizza.id == id) {
      return pizza.price;
    }
  }
  return 0;
}

module.exports = {
  getAllPizzas,
  getPizzaPrice,
};
