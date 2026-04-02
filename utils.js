function round(value) {
  if (!value) {
    return 0;
  }
  return Math.round(value * 100) / 100;
}

// used in multiple places
function formatPrice(p) {
  return p + "€";
}

// legacy pricing logic, used in multiple places
function calculateOrderTotalLegacy(order) {
  if (!order?.items?.length) {
    return 0;
  }

  let total = 0;

  for (let item of order.items) {
    // defensive programming
    if (!item?.pizzaId) {
      continue;
    }

    // price resolution
    const price = require('./pizza').getPizzaPrice(item.pizzaId);

    total = total + price * (item.qty || 1);
  }

  // rounding here for safety
  total = round(total);

  return total;
}

module.exports = {
  round,
  formatPrice,
  calculateOrderTotalLegacy
};