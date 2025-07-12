import pino from "pino";

/**
 * Configures and returns Pino logger settings based on the current environment.
 *
 * This function sets up:
 * - Custom serializers for requests, responses, and errors to control logged output.
 * - Log redaction to prevent sensitive information (e.g., Authorization headers) from being logged.
 * - Pretty-printing in local development using `pino-pretty`.
 * - ISO timestamp formatting and uppercase levels in production.
 *
 * The environment is determined from `process.env.ENVIRONMENT` and can be:
 * - `"local"` for local development (pretty logs, debug level).
 * - `"production"` for structured logs (info level, redactions, ISO timestamps).
 * - `"test"` disables logging (returns `false`).
 *
 * If `process.env.ENVIRONMENT` is not set, defaults to production settings.
 *
 * @returns {Object|false} The Pino-compatible logger configuration for Fastify or `false` to disable logging (e.g., in tests).
 */
export function configureLogger() {
  // pino automatically logs on startup, on incoming request, on request completion, on error
  // set custom serializers to overwrite fastify default
  const serializers = {
    req: (request) => ({
      method: request.method,
      url: request.url,
      headers: request.headers, // extra
      ip: request.ip,
    }),
    res: (reply) => ({
      statusCode: reply.statusCode,
    }),
    err: pino.stdSerializers.err,
  };
  // set up log redaction paths
  const redactions = {
    paths: ["*.headers.authorization"],
  };
  // set up logging based on environment
  const envToLogger = {
    local: {
      transport: {
        target: "pino-pretty",
        options: {
          translateTime: "HH:MM:ss Z",
          ignore: "pid,hostname",
          levelFirst: true,
        },
      },
      level: process.env.LOG_LEVEL || "debug",
      serializers: serializers,
    },
    production: {
      timestamp: pino.stdTimeFunctions.isoTime,
      formatters: {
        level: (label) => ({ level: label.toUpperCase() }),
      },
      level: process.env.LOG_LEVEL || "info",
      redact: redactions,
      serializers: serializers,
    },
    test: false,
  };
  return Object.prototype.hasOwnProperty.call(
    envToLogger,
    process.env.ENVIRONMENT,
  ) // default to production if no value
    ? envToLogger[process.env.ENVIRONMENT]
    : envToLogger["production"];
}
