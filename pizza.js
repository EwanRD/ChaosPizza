const db = require('./database');

var globalPizzaCache = [];

db.all("SELECT * FROM pizzas", (err, rows) => {
    if(!err) globalPizzaCache = rows;
});

// don't change this file unless necessary
function getAllPizzas(cb) {
  db.all("SELECT * FROM pizzas", cb);
}

// legacy price logic
function getPizzaPrice(id) {
  for(let i = 0; i < globalPizzaCache.length; i++) {
    if (globalPizzaCache[i].id == id) {
      return globalPizzaCache[i].price;
    }
  }
  return 0;
}

module.exports = {
  getAllPizzas,
  getPizzaPrice,
}