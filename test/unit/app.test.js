import t from "tap";
import buildServer from "../../src/app.js";

t.test("Fastify app builds and registers core features", async (t) => {
  const fastify = buildServer();

  t.teardown(() => fastify.close());

  t.plan(3);

  // Test server boots up
  await fastify.ready();
  t.ok(fastify, "Fastify instance is created and ready");

  // Test healthcheck plugin was registered
  const res = await fastify.inject({
    method: "GET",
    url: "/food-orders/api/v1/health/check",
  });

  t.equal(res.statusCode, 200, "Healthcheck route is available");

  // Test applicationVariables decorator exists
  t.ok(
    Object.getOwnPropertyDescriptor(fastify, "applicationVariables")?.get,
    "applicationVariables decorator is registered as a getter",
  );
});

// t.test(
//   "registerErrorHandler - handles uncaught errors and logs them",
//   async (t) => {
//     const fastify = buildServer();
//
//     // Add a route that throws an unhandled error
//     fastify.get("/error-test", async (req, reply) => {
//       throw new Error("Simulated failure");
//     });
//
//     await fastify.ready();
//
//     const response = await fastify.inject({
//       method: "GET",
//       url: "/error-test",
//     });
//
//     t.equal(response.statusCode, 500, "should return 500 status code");
//     t.same(
//       JSON.parse(response.body),
//       { error: "Internal Server Error" },
//       "should return correct error body",
//     );
//   },
// );
