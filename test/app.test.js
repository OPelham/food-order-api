import t from "tap";
import buildServer from "../src/app.js";

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
