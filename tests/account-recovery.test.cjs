const test = require("node:test");
const assert = require("node:assert/strict");
const engine = require("../demos/tickets/engine.js");

test("account recovery returns support guidance without calling services", () => {
  const data = engine.initialData();
  const ticket = data.tickets.find(ticket => ticket.scenario === "known");
  const result = engine.plan(ticket, data.history);
  assert.match(result.response, /He olvidado mi contraseña/);
  assert.match(result.response, /no compartas tu contraseña/);
  assert.equal(result.apiCalls.length, 0);
  assert.equal(result.needsHuman, false);
});
