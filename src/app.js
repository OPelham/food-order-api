import Fastify from 'fastify'
import Ajv from 'ajv-oai'
import pino from 'pino'
import * as fs from "node:fs";
import onReadyHook from "./hooks/on-ready-hook.js";
import { ingredientRoutes } from "./routes/ingredients-routes.js";

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

// ==== logger configuration ====
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

// ==== create server instance ====
const fastify = Fastify({
    logger: envToLogger[process.env.ENVIRONMENT] ?? envToLogger["production"], // default to production if no value
    exposeHeadRoutes: false,
    requestIdHeader: 'correlation-id', // take this header as reqId
    requestIdLogLabel: 'correlation-id' // rename reqId in logs to this value
})

// ==== registrations ====
// error handler
function registerErrorHandler() {
    const log = fastify.log.child({ module: "Error handler"})
    log.info("Registered error handler")
}
registerErrorHandler()

// decorators
function registerDecorators() {
    const log = fastify.log.child({ module: "Decorators" })
    fastify.decorate("applicationVariables", {
        getter() {
            return applicationVariables;
        }
    });
    log.info("Registered decorators");
}
registerDecorators()

// hooks
function registerHooks() {
    const log = fastify.log.child({ module: "Hooks" })
    fastify.addHook('onSend', async (request, reply, payload) => {
        request.log.debug({response: payload}, 'response payload');
    });
    fastify.addHook('preValidation', async (request, reply) => {
        if (request.body) {
            request.log.debug({ body: request.body }, 'incoming request body');
        } else {
            request.log.debug('no request body present');
        }
    });
    fastify.addHook("onReady", async () => {
        onReadyHook(fastify);
    })
    log.info("Registered hooks");
}
registerHooks();


// plugin
function registerPlugins() {
    const log = fastify.log.child({ module: 'Plugins' });
    fastify.register(import("fastify-healthcheck"), {
        logLevel: "warn",
        healthcheckUrl: `/${prefix}/health/check`,
    });
    log.info("Registered plugins");
}
registerPlugins();

// routes
function registerRoutes() {
    const log = fastify.log.child({ module: "Routes" })
    fastify.register(ingredientRoutes, { prefix: prefix })
    log.info("Registered routes");
}
registerRoutes();

//validation
function registerValidation() {
    const log = fastify.log.child({ module: "Validation" })
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