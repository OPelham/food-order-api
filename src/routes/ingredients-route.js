/**
 * Encapsulates the ingredients routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */
async function routes (fastify, options) {
    fastify.get('/', async (request, reply) => {
        // request.log.debug({ request })
        return { hello: 'world' }
    })
}

export default routes;