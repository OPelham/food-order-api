import * as controller from "../controllers/ingredients-controller.js";

/**
 * Encapsulates the ingredients routes
 * @param {FastifyInstance} fastify  Encapsulated Fastify Instance
 * @param {Object} options plugin options, refer to https://fastify.dev/docs/latest/Reference/Plugins/#plugin-options
 */
export async function routes (fastify) {
    // fastify.get('/ingredients/{ingredientId}', controller.getIngredientById())
    fastify.route({
        method: 'GET',
        url: '/ingredients/:ingredientId',
        schema: {
            querystring: {
                name: { type: 'string' },
                excitement: { type: 'integer' }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        hello: { type: 'string' }
                    }
                }
            }
        },
        handler: await controller.getIngredientById
    })
}