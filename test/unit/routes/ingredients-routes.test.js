import t from "tap";
import Fastify from "fastify";
import { ingredientRoutes } from "../../../src/routes/ingredients-routes.js";

t.test(
  "GET /ingredients/:ingredientId - returns mocked ingredient",
  async (t) => {
    const fastify = Fastify();

    // Mock controller with predictable response
    const controller = {
      getIngredientById: async (req, reply) => {
        return reply.send({ id: req.params.ingredientId, name: "Tomato" });
      },
    };

    // Minimal schema object to satisfy Fastify's input
    const schemas = {
      //todo check with actual schema and stub request
      paths: {
        "/ingredients/{ingredientId}": {
          params: {
            type: "object",
            properties: {
              ingredientId: { type: "string" },
            },
            required: ["ingredientId"],
          },
          response: {
            200: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
              },
            },
          },
        },
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
      url: "/ingredients/57526bf4-7226-4195-b5d6-0219923f65b1",
    });

    t.equal(response.statusCode, 200);
    t.same(JSON.parse(response.body), {
      id: "57526bf4-7226-4195-b5d6-0219923f65b1",
      name: "Tomato",
    });
    t.end();
  },
);

import { Ingredient } from "../../../src/domain/ingredient.js";

t.test("domain class works", (t) => {
  const i = new Ingredient({
    id: "57526bf4-7226-4195-b5d6-0219923f65b1",
    name: "Carrot",
    quantity: 5,
  });
  t.same(i.toDTO(), {
    id: "57526bf4-7226-4195-b5d6-0219923f65b1",
    name: "Carrot",
    quantity: 5,
  });
  t.end();
});

//todo test schema violations
