/**
 * Creates the controller that handles Fastify HTTP logic for ingredients.
 *
 * @param {Object} service - Ingredient service with business operations.
 * @returns {Object} Controller with route handlers.
 */
export function createIngredientController(service) {
  return {
    /**
     * Handles GET /ingredients/:ingredientId requests.
     *
     * @param {FastifyRequest} request - Fastify request object
     * @param {FastifyReply} reply - Fastify reply object
     */
    async getIngredientById(request, reply) {
      const log = request.log;
      const childLog = log.child({ module: "getIngredientById-controller" });

      const { ingredientId } = request.params;
      const getIngredientResponse = await service.getIngredientById(
        ingredientId,
        log,
      );

      childLog.debug({ getIngredientResponse: getIngredientResponse });

      reply.send(getIngredientResponse);
    },

    /**
     * Handles POST /ingredients requests.
     *
     * @param {FastifyRequest} request - Fastify request object
     * @param {FastifyReply} reply - Fastify reply object
     */
    async addIngredient(request, reply) {
      const log = request.log;
      const childLog = log.child({ module: "addIngredient-controller" });

      const addIngredientRequestBody = request.body;
      const addIngredientResponse = await service.addIngredient(
        addIngredientRequestBody,
        log,
      );

      childLog.debug(
        { addIngredientResponse: addIngredientResponse },
        "controller response",
      );

      reply.send(addIngredientResponse);
    },
  };
}
