import t from "tap";
import buildServer from "../../src/app.js";
import esmock from "esmock";

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

t.test("loads dotenv when ENVIRONMENT=local", async (t) => {
  // Arrange
  process.env.ENVIRONMENT = "local";
  let configCalled = false;

  // Act: Mock dotenv and import app
  await esmock("../../src/app.js", {
    dotenv: {
      config: () => {
        configCalled = true;
      },
    },
  });

  // Assert
  t.ok(configCalled, "dotenv.config() should be called when ENVIRONMENT=local");
});

t.test("does not load dotenv when ENVIRONMENT is not local", async (t) => {
  // Arrange
  process.env.ENVIRONMENT = "production";
  let configCalled = false;

  await esmock("../../src/app.js", {
    dotenv: {
      config: () => {
        configCalled = true;
      },
    },
  });

  t.notOk(
    configCalled,
    "dotenv.config() should NOT be called when ENVIRONMENT is not local",
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
