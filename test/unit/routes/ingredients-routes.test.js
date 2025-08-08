import t from "tap";
import Fastify from "fastify";
import { ingredientRoutes } from "../../../src/routes/ingredients-routes.js";
import { schemas } from "../../../src/schemas/index.js";

// import mocks
const mockIngredientMandatoryFieldsJSON = fs.readFileSync(
  "./test/stubs/common/ingredientDTO.json",
  "utf8",
);
const mockIngredient = JSON.parse(mockIngredientMandatoryFieldsJSON);

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
      addIngredient: async (req, reply) => {
        t.same(req.body, mockIngredient);
        return reply
          .code(201)
          .send({ ingredientId: "4a73cd29-c1c8-47da-a65b-4a7c295bbea5" });
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

t.test("POST /ingredients - triggers preHandler and returns 201", async (t) => {
  const fastify = Fastify({ logger: false });

  const mockSanitizedIngredient = {
    name: "Tomato",
    quantity: 3,
    category: "FROZEN",
  };

  const controller = {
    getIngredientById: async (req, reply) => reply.send(mockIngredient),
    addIngredient: async (req, reply) => {
      t.same(req.body, mockSanitizedIngredient);
      return reply
        .code(201)
        .send({ ingredientId: "4a73cd29-c1c8-47da-a65b-4a7c295bbea5" });
    },
  };

  fastify.register(ingredientRoutes, {
    controller,
    schemas,
  });

  await fastify.ready();
  t.teardown(() => fastify.close());

  const response = await fastify.inject({
    method: "POST",
    url: "/ingredients",
    headers: { "correlation-id": validCorrelationId },
    payload: mockSanitizedIngredient,
  });

  t.equal(response.statusCode, 201);
  t.same(JSON.parse(response.body), {
    ingredientId: "4a73cd29-c1c8-47da-a65b-4a7c295bbea5",
  });
  t.end();
});

t.test("POST /ingredients - invalid payload triggers 400", async (t) => {
  const fastify = Fastify();

  const controller = {
    getIngredientById: async (req, reply) => reply.send(mockIngredient),
    addIngredient: async (req, reply) => {
      // Should not hit this
      t.fail("Controller should not be called on schema validation failure");
      return reply.code(500).send();
    },
  };

  fastify.register(ingredientRoutes, {
    controller,
    schemas,
  });

  await fastify.ready();
  t.teardown(() => fastify.close());

  const response = await fastify.inject({
    method: "POST",
    url: "/ingredients",
    headers: { "correlation-id": validCorrelationId },
    payload: { name: "Missing fields" },
  });

  t.equal(response.statusCode, 400);
  const body = JSON.parse(response.body);
  t.match(body.message, "body must have required property 'quantity'");
  t.end();
});

t.test(
  "POST /ingredients - sanitizes malicious name and logs warning",
  async (t) => {
    const fastify = Fastify({
      logger: {
        level: "warn",
        stream: {
          write: (msg) => {
            t.match(msg, /Input Sanitized/);
          },
        },
      },
    });

    const maliciousInput = {
      name: "<script>alert('xss')</script>",
      quantity: 2,
      category: "CHILLED",
    };

    const expectedSanitized = {
      ...maliciousInput,
      name: "&lt;script&gt;alert('xss')&lt;/script&gt;",
    };

    const controller = {
      getIngredientById: async (req, reply) => reply.send(mockIngredient),
      addIngredient: async (req, reply) => {
        t.same(req.body, expectedSanitized);
        return reply
          .code(201)
          .send({ ingredientId: "4a73cd29-c1c8-47da-a65b-4a7c295bbea5" });
      },
    };

    fastify.register(ingredientRoutes, {
      controller,
      schemas,
    });

    await fastify.ready();
    t.teardown(() => fastify.close());

    const response = await fastify.inject({
      method: "POST",
      url: "/ingredients",
      headers: { "correlation-id": validCorrelationId },
      payload: maliciousInput,
    });

    t.equal(response.statusCode, 201);
    t.same(JSON.parse(response.body), {
      ingredientId: "4a73cd29-c1c8-47da-a65b-4a7c295bbea5",
    });
    t.end();
  },
);
