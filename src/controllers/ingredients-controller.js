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
      const controllerLog = log.child({ model: "ingredients-controller" });

      try {
        const { ingredientId } = request.params;
        const ingredient = await service.getById(ingredientId, log);
        controllerLog.debug({ ingredient: ingredient });
        reply.send(ingredient);
      } catch (err) {
        if (err.message === "Ingredient not found") {
          reply.code(404).send({ error: err.message });
        } else {
          controllerLog.error(err);
          reply.code(500).send({ error: "Internal Server Error" });
        }
      }
    },
  };
}
