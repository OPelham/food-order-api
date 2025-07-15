import t from "tap";
import Fastify from "fastify";
import dotenv from "dotenv";

// import mocks
const mockDatabaseResponseJSON = fs.readFileSync(
  "./test/stubs/get-ingredient-by-id/postgres-database-response-success.json",
  "utf8",
);
const mockIngredientJSON = fs.readFileSync(
  "./test/stubs/get-ingredient-by-id/ingredientDTO.json",
  "utf8",
);
const mockIngredient = JSON.parse(mockIngredientJSON);

const validCorrelationId = "63952edf-0d25-6216-2905-da621999d9ad";

// const mockDatabaseResponse = JSON.parse(mockDatabaseResponseJSON);
// // Create a fake DB with stubbed query method
// const mockDB = {
//   query: async (text, params) => {
//     if (text.includes("SELECT")) {
//       return mockDatabaseResponse;
//     }
//     return { rows: [] };
//   },
// }; //todo remove

// Mock repository, service, and controller like your app does
import { createDatabase } from "../../src/infrastructure/database.js";
import { createIngredientRepository } from "../../src/repositories/ingredient-repository.js";
import { createIngredientService } from "../../src/services/ingredients-service.js";
import { createIngredientController } from "../../src/controllers/ingredients-controller.js";
import { schemas } from "../../src/schemas/index.js";
import { applicationVariables } from "../../src/config/index.js";
import { configureLogger } from "../../src/lib/logger.js";
import { ingredientRoutes } from "../../src/routes/ingredients-routes.js";
import Ajv from "ajv-oai";
import fs from "node:fs";
import { config } from "dotenv";

// Build isolated app
function buildIsolatedApp(mockLogger) {
  const fastify = Fastify({ logger: false });

  dotenv.config();

  if (mockLogger) {
    fastify.log = mockLogger;
  }

  const database = createDatabase({
    connectionString: process.env.DATABASE_URL,
  });
  const ingredientRepository = createIngredientRepository(database);
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

t.test(
  "GET /ingredients/:ingredientId returns mocked ingredient",
  async (t) => {
    const app = buildIsolatedApp();

    const response = await app.inject({
      method: "GET",
      url: `/food-orders/api/v1/ingredients/${mockIngredient.ingredientId}`,
      headers: {
        "correlation-id": validCorrelationId,
      },
    });

    t.equal(response.statusCode, 200);
    t.same(JSON.parse(response.payload), mockIngredient);
  },
);

//todo set this up for schema validation when error handling is in place
// t.test("GET /ingredients/:ingredientId returns mocked ingredient", async (t) => {
//   const app = buildIsolatedApp();
//
//   const response = await app.inject({
//     method: "GET",
//     url: `/food-orders/api/v1/ingredients/${mockIngredient.ingredientId}`,
//     headers: {
//       "correlation-id": validCorrelationId,
//     },
//   });
//
//   t.equal(response.statusCode, 200);
//   t.same(JSON.parse(response.payload), mockIngredient);
// });

// todo test all error options
