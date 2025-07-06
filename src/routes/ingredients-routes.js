import * as controller from "../controllers/ingredients-controller.js";

/**
 * Registers ingredient-related routes for the Fastify application.
 *
 * Currently includes:
 * - `GET /ingredients/:ingredientId`: Fetch a single ingredient by its ID.
 *
 * Schema validation is provided for query string and response.
 *
 * @async
 * @param {FastifyInstance} fastify - The Fastify instance to which routes are registered.
 * @param {Object} options - Plugin options (see Fastify plugin API for details).
 */
export async function ingredientRoutes (fastify) {
    fastify.route({
        method: 'GET',
        url: '/ingredients/:ingredientId',
        schema: { //todo sort schema
            querystring: {
                name: { type: 'string' },
                excitement: { type: 'integer' }
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        ingredientId: {
                            type: 'string',
                        },
                    }
                }
            }
        },
        handler: await controller.getIngredientById
    })
    // fastify.route({
    //     method: 'GET',
    //     url: '/ingredients/findByAvailability',
    //     schema: { //todo sort schema
    //         querystring: {
    //             name: { type: 'string' },
    //             excitement: { type: 'integer' }
    //         },
    //         response: {
    //             200: {
    //                 type: 'object',
    //                 properties: {
    //                     ingredientId: {
    //                         type: 'string',
    //                     },
    //                 }
    //             }
    //         }
    //     },
    //     handler: await controller.getIngredientByAvailability
    // })
}