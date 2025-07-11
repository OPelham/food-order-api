import t from "tap";

// ---- Manual Mock Function ----
function createMockFn() {
  const fn = (...args) => {
    fn.calls.push(args);
    if (fn.implementation) return fn.implementation(...args);
  };
  fn.calls = [];
  fn.implementation = null;
  fn.reset = () => {
    fn.calls = [];
    fn.implementation = null;
  };
  fn.resolves = (val) => {
    fn.implementation = () => Promise.resolve(val);
  };
  return fn;
}

// ---- Mocks ----
const mockQuery = createMockFn();
const mockPool = { query: mockQuery };

const PoolMock = function (config) {
  PoolMock.calls.push(config);
  return mockPool;
};
PoolMock.calls = [];
PoolMock.reset = () => {
  PoolMock.calls = [];
};

t.test("createDatabase creates Pool with connection string", async (t) => {
  PoolMock.reset();
  mockQuery.reset();
  mockQuery.resolves("mock-result");

  const { createDatabase } = await t.mockImport(
    "../../../src/infrastructure/database.js",
    {
      pg: { Pool: PoolMock },
    },
  );

  const config = { connectionString: "postgres://user:pass@localhost/db" };
  const db = createDatabase(config);

  t.equal(PoolMock.calls.length, 1, "Pool was instantiated once");
  t.same(PoolMock.calls[0], config, "Pool received correct config");

  const sql = "SELECT 1";
  const params = [];
  const result = await db.query(sql, params);

  t.equal(mockQuery.calls.length, 1, "pool.query called once");
  t.same(mockQuery.calls[0], [sql, params], "pool.query received correct args");
  t.equal(result, "mock-result", "query returned mocked result");

  t.equal(db.pool, mockPool, "db exposes the correct pool instance");
});
