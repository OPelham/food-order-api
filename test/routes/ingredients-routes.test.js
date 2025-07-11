// import t from 'tap';
// import sinon from 'sinon';
// import { ingredientRoutes } from '../../src/routes/ingredients-routes.js';
//
// t.test('ingredientRoutes registers GET /ingredients/:ingredientId correctly', async (t) => {
//   const fastifyMock = {
//     route: sinon.spy(),
//   };
//
//   const fakeHandler = async () => {};
//   const fakeSchema = {
//     description: 'Fake schema for testing',
//   };
//
//   const mockController = {
//     getIngredientById: fakeHandler,
//   };
//
//   const mockSchemas = {
//     paths: {
//       "/ingredients/{ingredientId}": fakeSchema,
//     },
//   };
//
//   await ingredientRoutes(fastifyMock, {
//     controller: mockController,
//     schemas: mockSchemas,
//   });
//
//   t.ok(fastifyMock.route.calledOnce, 'fastify.route should be called once');
//
//   const routeArgs = fastifyMock.route.firstCall.args[0];
//
//   t.equal(routeArgs.method, 'GET', 'method should be GET');
//   t.equal(routeArgs.url, '/ingredients/:ingredientId', 'correct route path');
//   t.equal(routeArgs.handler, fakeHandler, 'handler should match controller.getIngredientById');
//   t.same(routeArgs.schema, fakeSchema, 'schema should match the injected schema object');
// });

import t from "tap";
import Fastify from "fastify";
import { ingredientRoutes } from "../../src/routes/ingredients-routes.js";

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
      url: "/ingredients/abc123",
    });

    t.equal(response.statusCode, 200);
    t.same(JSON.parse(response.body), { id: "abc123", name: "Tomato" });
  },
);

import { Ingredient } from "../../src/domain/ingredient.js";

t.test("domain class works", (t) => {
  const i = new Ingredient({ id: "1", name: "Carrot", quantity: 5 });
  t.same(i.toDTO(), { id: "1", name: "Carrot", quantity: 5 });
  t.end();
});
