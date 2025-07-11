import t from "tap";
import Fastify from "fastify";

// Create a fake DB with stubbed query method
const mockDB = {
  query: async (text, params) => {
    if (text.includes("SELECT")) {
      return { rows: [{ id: 1, name: "Tomato" }] };
    }
    return { rows: [] };
  },
};

// Mock repository, service, and controller like your app does
import { createIngredientRepository } from "../../src/repositories/ingredient-repository.js";
import { createIngredientService } from "../../src/services/ingredients-service.js";
import { createIngredientController } from "../../src/controllers/ingredients-controller.js";
import { schemas } from "../../src/schemas/index.js";
import { applicationVariables } from "../../src/config/index.js";
import { configureLogger } from "../../src/lib/logger.js";
import { ingredientRoutes } from "../../src/routes/ingredients-routes.js";
import Ajv from "ajv-oai";

// Build isolated app
function buildIsolatedApp() {
  const fastify = Fastify({
    logger: false,
  });

  const ingredientRepository = createIngredientRepository(mockDB);
  const ingredientService = createIngredientService(ingredientRepository);
  const ingredientController = createIngredientController(ingredientService);

  const prefix = `${applicationVariables.applicationName}/api/${applicationVariables.version}`;

  fastify.register(ingredientRoutes, {
    prefix: prefix,
    schemas: schemas,
    controller: ingredientController,
  });

  // setup AJV for validation
  const ajv = new Ajv({
    removeAdditional: false,
    useDefaults: true,
    coerceTypes: false,
    allErrors: true,
    nullable: true,
  });
  fastify.setValidatorCompiler(({ schema }) => ajv.compile(schema));

  return fastify;
}

t.test("GET /ingredients/:ingredientId returns fake list", async (t) => {
  const app = buildIsolatedApp();

  const response = await app.inject({
    method: "GET",
    url: "/food-orders/api/v1/ingredients/57526bf4-7226-4195-b5d6-0219923f65b1",
  });

  t.equal(response.statusCode, 200);
  console.log({ response });
  t.same(JSON.parse(response.payload), { id: 1, name: "Tomato" });
});
