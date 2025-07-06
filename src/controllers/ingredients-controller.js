import * as service from "../services/ingredients-service.js";

/**
 * GET /ingredients/:ingredientId
 *
 * Controller to retrieve a single ingredient by its ID.
 *
 * - Extracts `ingredientId` from the request path parameters.
 * - Calls the service layer to fetch the ingredient.
 * - Returns a 200 response with the ingredient data if found.
 * - Returns a 404 if the ingredient does not exist.
 * - Returns a 500 for unexpected errors and logs them.
 *
 * @param {import('fastify').FastifyRequest} request - Fastify request object
 * @param {import('fastify').FastifyReply} reply - Fastify reply object
 * @returns {Promise<void>}
 */
export async function getIngredientById(request, reply) {
    const log = request.log.child({ model: "ingredients-controller.js" });
    try {
        const { ingredientId } = request.params;
        log.trace(`calling ingredient-controller with ingredientId: ${ingredientId}`);
        const ingredient = await service.getById(ingredientId);
        log.trace(`sending reply of: ${ingredient}`);
        reply.send(ingredient);
    } catch (err) {
        if (err.message === 'Ingredient not found') {
            reply.code(404).send({ error: err.message });
        } else {
            log.error(err);
            reply.code(500).send({ error: 'Internal Server Error' });
        }
    }
}