import Fastify from 'fastify'
import pino from 'pino'
import ingredientsRoute from "./routes/ingredients-route.js";

// set custom serializers to overwrite fastify default
// pino automatically logs on startup, on incoming request, on request completion, on error
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
    // err: pino.stdSerializers.err
}
// sets up log redaction paths
const redactions = {
    paths: [
        "*.headers.authorization"
    ]
}
// sets up logging based on environment
const envToLogger = {
    development: {
        transport: {
            target: 'pino-pretty',
            options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
                levelFirst: true,
            },
        },
        level: 'debug',
        exposeHeadRoute: false,
        serializers: serializers
    },
    production: {
        timestamp: pino.stdTimeFunctions.isoTime,
        formatters: {
            level: (label) => ({level: label.toUpperCase()}),
        },
        level: process.env.LOG_LEVEL ?? 'info',
        exposeHeadRoute: false,
        redact: redactions,
        serializers: serializers,
    },
    test: false,
}

const fastify = Fastify({
    logger: envToLogger[process.env.ENVIRONMENT] ?? envToLogger["production"], // default to production if no value
    requestIdHeader: 'correlation-id', // take this header as reqId
    requestIdLogLabel: 'correlation-id' // rename reqId in logs to this value
})

fastify.register(ingredientsRoute)

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

/**
 * Run the server!
 */
const start = async () => {
    try {
        await fastify.listen({port: 3000})
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
start()