import t from "tap";
import Fastify from "fastify";

// todo refactor with dependency injection if cant get mockImport to work
t.test("ingredientRoutes uses mock controller", async (t) => {
  // Step 1: Mock the controller
  const mockController = {
    getIngredientById: async (req, res) => {
      if (req.params.ingredientId === "notfound") {
        res.code(404).send({ error: "Ingredient not found" });
      } else {
        res.send({ ingredientId: req.params.ingredientId });
      }
    },
  };

  // Step 2: Replace controller with mock using tap.mockImport
  const { ingredientRoutes: mockedRoutes } = await t.mockImport(
    "../../src/routes/ingredients-routes.js",
    {
      "../controllers/ingredients-controller.js": mockController,
    },
  );

  // Step 3: Set up a real Fastify instance using mocked routes
  const fastify = Fastify();
  fastify.register(mockedRoutes, { prefix: "/mock" });
  await fastify.ready();
  t.teardown(() => fastify.close());

  // Step 4: Run tests
  t.test("returns 200 for valid ID", async (t) => {
    const res = await fastify.inject({
      method: "GET",
      url: "/mock/ingredients/abc123",
    });

    t.equal(res.statusCode, 200);
    t.same(JSON.parse(res.body), { ingredientId: "abc123" });
  });

  t.test("returns 404 for notfound", async (t) => {
    const res = await fastify.inject({
      method: "GET",
      url: "/mock/ingredients/notfound",
    });

    t.equal(res.statusCode, 404);
    t.same(JSON.parse(res.body), { error: "Ingredient not found" });
  });
});
