import t from "tap";
import Fastify from "fastify";
import { ingredientRoutes } from "../../../src/routes/ingredients-routes.js";
import { schemas } from "../../../src/schemas/index.js";

// import mocks
const mockIngredientJSON = fs.readFileSync(
  "./test/stubs/get-ingredient-by-id/ingredientDTO.json",
  "utf8",
);
const mockIngredient = JSON.parse(mockIngredientJSON);

const validCorrelationId = "63952edf-0d25-6216-2905-da621999d9ad";

t.test(
  "GET /ingredients/:ingredientId - returns mocked ingredient",
  async (t) => {
    const fastify = Fastify();

    // Mock controller with predictable response
    const controller = {
      getIngredientById: async (req, reply) => {
        return reply.send(mockIngredient);
      },
    };

    // Register the route with mock controller and schema
    fastify.register(ingredientRoutes, {
      controller,
      schemas,
    });

    await fastify.ready();
    t.teardown(() => fastify.close());

    const response = await fastify.inject({
      method: "GET",
      url: `/ingredients/${mockIngredient.ingredientId}`,
      headers: {
        "correlation-id": validCorrelationId,
      },
    });

    t.equal(response.statusCode, 200);
    t.same(JSON.parse(response.body), mockIngredient);
    t.end();
  },
);

import { Ingredient } from "../../../src/domain/ingredient.js";
import fs from "node:fs";

t.test("domain class works", (t) => {
  const ingredient = new Ingredient(mockIngredient);
  t.same(ingredient.toDTO(), mockIngredient);
  t.end();
});

//todo test schema violations
