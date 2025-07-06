import Fastify from 'fastify'
import Ajv from 'ajv-oai'
import pino from 'pino'
import * as fs from "node:fs";
import onReadyHook from "./hooks/on-ready-hook.js";
import { ingredientRoutes } from "./routes/ingredients-routes.js";
import onSendHook from "./hooks/on-send-hook.js";
import preValidationHook from "./hooks/pre-validation-hook.js";

const applicationVariables = JSON.parse(
    fs.readFileSync(
        './src/config/application-variables.json',
        "utf8"
    )
);
const prefix = `${applicationVariables.applicationName}/${applicationVariables.version}`;
const port = applicationVariables.port;

// ==== schema creation ===
function generateSchema() { //todo
    //todo use npm install @apidevtools/json-schema-ref-parser to de ref api spec schemas then import as a schema file for reference?
}

// ==== create server instance ====
const fastify = Fastify({
    logger: configureLogger(),
    exposeHeadRoutes: false,
    requestIdHeader: 'correlation-id', // take this header as reqId
    requestIdLogLabel: 'correlation-id' // rename reqId in logs to this value
})
const log = fastify.log.child({ module: "app.js"})

// ==== configure server ====
registerErrorHandler()
registerDecorators()
registerHooks();
registerPlugins();
registerRoutes();
registerValidation();

// ==== start server ====
const start = async () => {
    try {
        await fastify.listen({port: port})
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
start()

// ==== helper functions ====
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
function configureLogger() {
    // pino automatically logs on startup, on incoming request, on request completion, on error
    // set custom serializers to overwrite fastify default
    const serializers = {
        req: (request) => ({
            method: request.method,
            url: request.url,
            headers: request.headers,  // extra
            ip: request.ip
        }),
        res: (reply) => ({
            statusCode: reply.statusCode
        }),
        err: pino.stdSerializers.err
    }
    // set up log redaction paths
    const redactions = {
        paths: [
            "*.headers.authorization"
        ]
    }
    // set up logging based on environment
    const envToLogger = {
        local: {
            transport: {
                target: 'pino-pretty',
                options: {
                    translateTime: 'HH:MM:ss Z',
                    ignore: 'pid,hostname',
                    levelFirst: true,
                },
            },
            level: process.env.LOG_LEVEL ?? 'debug',
            serializers: serializers
        },
        production: {
            timestamp: pino.stdTimeFunctions.isoTime,
            formatters: {
                level: (label) => ({level: label.toUpperCase()}),
            },
            level: process.env.LOG_LEVEL ?? 'info',
            redact: redactions,
            serializers: serializers,
        },
        test: false,
    }
    return envToLogger[process.env.ENVIRONMENT] ?? envToLogger["production"] // default to production if no value
}

// todo add error handler and docstring
function registerErrorHandler() {

    log.info("Registered error handler")
}

/**
* Registers custom Fastify decorators.
*
* Adds `applicationVariables` as a getter to all Fastify requests,
* allowing structured access to application configuration across hooks,
* controllers, and plugins.
*/
function registerDecorators() {
    fastify.decorate("applicationVariables", {
        getter() {
            return applicationVariables;
        }
    });
    log.info("Registered decorators");
}

/**
 * Registers Fastify lifecycle hooks.
 *
 * - `onSend`: Executes before the response is sent to the client.
 * - `preValidation`: Runs before schema validation, useful for input cleanup or auth.
 * - `onReady`: Executes after all routes and plugins have been registered.
 */
function registerHooks() {
    fastify.addHook("onSend", async (request, reply, payload) => {
        onSendHook(request, reply, payload);
    })
    fastify.addHook('preValidation', async (request, reply) => {
        preValidationHook(request, reply);
    });
    fastify.addHook("onReady", async () => {
        onReadyHook(fastify);
    })
    log.info("Registered hooks");
}

/**
 * Registers third-party Fastify plugins.
 *
 * Includes:
 * - `fastify-healthcheck`: Adds a health check route for readiness/liveness probes.
 */
function registerPlugins() {
    fastify.register(import("fastify-healthcheck"), {
        logLevel: "warn",
        healthcheckUrl: `/${prefix}/health/check`,
    });
    log.info("Registered plugins");
}

/**
 * Registers application routes.
 *
 * Includes:
 * - `ingredientRoutes`: All ingredient-related API endpoints, mounted with the specified prefix.
 */
function registerRoutes() {
    fastify.register(ingredientRoutes, { prefix: prefix })
    log.info("Registered routes");
}

/**
 * Configures request/response validation using AJV.
 *
 * Sets custom AJV options including:
 * - `useDefaults`: Populate missing defaults in schemas.
 * - `nullable`: Enables support for `null` types in schemas.
 * - `allErrors`: Report all validation issues at once.
 *
 * Binds the AJV compiler to Fastify’s schema validation mechanism.
 */
function registerValidation() {
    const ajv = new Ajv({
        removeAdditional: false,
        useDefaults: true,
        coerceTypes: false,
        allErrors: true,
        nullable: true
    })
    fastify.setValidatorCompiler( ({ schema }) => ajv.compile(schema));
    log.info("Registered validation");
}