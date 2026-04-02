const helpers = require("../helpers");
test("noop returns null", () => {
  expect(helpers.noop()).toBeNull();
});
