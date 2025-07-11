/**
 * Registers ingredient-related routes.
 *
 * @param {FastifyInstance} fastify - Fastify server instance
 * @param {Object} options - Route options including controller
 * @param {Object} options.controller - Ingredient controller with route handlers
 */
export async function ingredientRoutes(fastify, options) {
  const { controller, schemas } = options;

  fastify.route({
    method: "GET",
    url: "/ingredients/:ingredientId",
    schema: schemas["getIngredientById"],
    handler: controller.getIngredientById,
  });
}
