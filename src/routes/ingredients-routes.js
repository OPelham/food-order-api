import { sanitizeUserInput } from "../lib/ingredients-input-sanitiser.js";

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

  fastify.route({
    method: "POST",
    url: "/ingredients",
    schema: schemas["addIngredient"],
    preHandler: async (request, reply) => {
      const log = request.log;
      const childLog = log.child({ module: "addIngredient-route" });

      const { sanitizedInput, wasSanitized } = sanitizeUserInput(request.body);
      request.body = sanitizedInput;

      if (wasSanitized) {
        childLog.warn("Input Sanitized");
      }
    },
    handler: controller.addIngredient,
  });
}
