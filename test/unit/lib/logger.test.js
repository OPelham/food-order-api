import t from "tap";
import { configureLogger } from "../../../src/lib/logger.js";

t.test("configureLogger", (t) => {
  const originalEnv = process.env.ENVIRONMENT;
  const originalLogLevel = process.env.LOG_LEVEL;

  t.teardown(() => {
    process.env.ENVIRONMENT = originalEnv;
    process.env.LOG_LEVEL = originalLogLevel;
  });

  t.test("should return local logger config", (t) => {
    process.env.ENVIRONMENT = "local";
    process.env.LOG_LEVEL = "trace";
    const config = configureLogger();

    t.equal(config.level, "trace", "should use LOG_LEVEL from env");
    t.ok(config.transport, "should use pino-pretty transport");
    t.same(
      config.transport.target,
      "pino-pretty",
      "should use pino-pretty transport",
    );
    t.same(
      Object.keys(config.serializers),
      ["req", "res", "err"],
      "should define serializers",
    );
    t.end();
  });

  t.test("local serializers should use pino std serializers", (t) => {
    process.env.ENVIRONMENT = "local";
    const config = configureLogger();

    const mockRequest = {
      method: "POST",
      url: "/local-test",
      headers: { "x-test": "true" },
      ip: "192.168.0.1",
    };

    const mockReply = {
      statusCode: 404,
    };

    const mockError = new Error("Local error");
    mockError.customProp = "extra";

    const reqLog = config.serializers.req(mockRequest);
    const resLog = config.serializers.res(mockReply);
    const errLog = config.serializers.err(mockError);

    t.same(
      reqLog,
      {
        method: "POST",
        url: "/local-test",
        headers: { "x-test": "true" },
        ip: "192.168.0.1",
      },
      "local req serializer should return expected fields",
    );

    t.same(
      resLog,
      { statusCode: 404 },
      "local res serializer should return statusCode",
    );

    t.ok(
      errLog.stack && errLog.message === "Local error",
      "local err serializer should include stack and message",
    );

    t.end();
  });

  t.test("should use LOG_LEVEL if set in local environment", (t) => {
    process.env.ENVIRONMENT = "local";
    process.env.LOG_LEVEL = "trace";
    const config = configureLogger();

    t.equal(config.level, "trace", "should use LOG_LEVEL from env");

    t.end();
  });

  t.test("should default LOG_LEVEL to debug in local environment", (t) => {
    process.env.ENVIRONMENT = "local";
    delete process.env.LOG_LEVEL;
    const config = configureLogger();

    t.equal(
      config.level,
      "debug",
      "should default LOG_LEVEL to debug if not provided",
    );

    t.end();
  });

  t.test("should return production logger config", (t) => {
    process.env.ENVIRONMENT = "production";
    process.env.LOG_LEVEL = "";
    const config = configureLogger();

    t.equal(config.level, "info", "should default to info level");
    t.ok(typeof config.timestamp === "function", "should use ISO timestamp");
    t.same(
      Object.keys(config.redact),
      ["paths"],
      "should include redaction config",
    );
    t.type(
      config.formatters.level("warn"),
      "object",
      "should format level uppercase",
    );
    t.same(
      Object.keys(config.serializers),
      ["req", "res", "err"],
      "should define serializers",
    );
    t.end();
  });

  t.test(
    "should fallback to production config if ENVIRONMENT is unknown",
    (t) => {
      process.env.ENVIRONMENT = "foo"; // not defined in envToLogger
      const config = configureLogger();

      t.equal(config.level, "info", "should default to production config");
      t.ok(config.timestamp, "should include timestamp");
      t.end();
    },
  );

  t.test("should return false in test environment", (t) => {
    process.env.ENVIRONMENT = "test";
    const config = configureLogger();
    t.equal(config, false, "should disable logging in test");
    t.end();
  });

  t.test(
    "should fallback to production config if ENVIRONMENT is undefined",
    (t) => {
      delete process.env.ENVIRONMENT;
      const config = configureLogger();
      t.equal(config.level, "info", "should default to production config");
      t.ok(config.timestamp, "should include timestamp");
      t.end();
    },
  );

  t.test("production err serializer should exclude stack", (t) => {
    process.env.ENVIRONMENT = "production";
    const config = configureLogger();

    const error = new Error("Boom!");
    error.statusCode = 500;
    const errLog = config.serializers.err(error);

    t.same(
      errLog,
      {
        type: "Error",
        message: "Boom!",
        statusCode: 500,
      },
      "should only include type, message, and statusCode",
    );

    t.notOk(errLog.stack, "should not include stack trace");
    t.end();
  });

  t.test("err serializer should return input if not an object", (t) => {
    process.env.ENVIRONMENT = "production";
    const config = configureLogger();

    const errLog = config.serializers.err(null);
    t.equal(errLog, null, "should return null as-is");

    const stringLog = config.serializers.err("oops");
    t.equal(stringLog, "oops", "should return string as-is");

    t.end();
  });

  t.test("should invoke serializer functions", (t) => {
    process.env.ENVIRONMENT = "production";
    const config = configureLogger();

    const mockRequest = {
      method: "GET",
      url: "/test",
      headers: { authorization: "Bearer token" },
      ip: "127.0.0.1",
    };

    const mockReply = {
      statusCode: 200,
    };

    const mockError = new Error("Something went wrong");

    const reqLog = config.serializers.req(mockRequest);
    const resLog = config.serializers.res(mockReply);
    const errLog = config.serializers.err(mockError);

    t.same(
      reqLog,
      {
        method: "GET",
        url: "/test",
        headers: { authorization: "Bearer token" },
        ip: "127.0.0.1",
      },
      "req serializer should return correct fields",
    );

    t.same(
      resLog,
      { statusCode: 200 },
      "res serializer should return statusCode",
    );
    t.match(
      errLog,
      { message: "Something went wrong" },
      "err serializer should serialize error",
    );

    t.end();
  });

  t.end();
});
