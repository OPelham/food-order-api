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

t.test("registerErrorHandler", async (t) => {
  const fastify = buildServer();

  // Add a route that throws a basic error
  fastify.get("/test-unhandled-error", async () => {
    throw new Error("An unexpected error occurred");
  });

  // Add a route that throws an error with statusCode and message
  fastify.get("/test-custom-error", async () => {
    const err = new Error("Custom failure");
    err.statusCode = 403;
    err.name = "ForbiddenError";
    return Promise.reject(err);
  });

  await fastify.ready();

  t.test("handles generic error with default status/message", async (t) => {
    const res = await fastify.inject({
      method: "GET",
      url: "/test-unhandled-error",
    });

    t.equal(res.statusCode, 500, "should return 500 for generic errors");

    const body = JSON.parse(res.body);
    t.same(
      body,
      {
        statusCode: 500,
        error: "Error",
        message: "An unexpected error occurred",
      },
      "should return default error structure",
    );
    t.end();
  });

  t.test("handles custom error with provided status and message", async (t) => {
    const res = await fastify.inject({
      method: "GET",
      url: "/test-custom-error",
    });

    t.equal(res.statusCode, 403, "should return custom status code");

    const body = JSON.parse(res.body);
    t.same(
      body,
      {
        statusCode: 403,
        error: "ForbiddenError",
        message: "Custom failure",
      },
      "should return custom error body",
    );
    t.end();
  });
});
