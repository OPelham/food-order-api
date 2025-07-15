import Fastify from "fastify";
import Ajv from "ajv-oai";
import { applicationVariables } from "./config/index.js";
import { schemas } from "./schemas/index.js";
import { configureLogger } from "./lib/logger.js";

import onReadyHook from "./hooks/on-ready-hook.js";
import onSendHook from "./hooks/on-send-hook.js";
import preValidationHook from "./hooks/pre-validation-hook.js";

import { createDatabase } from "./infrastructure/database.js";
import { ingredientRoutes } from "./routes/ingredients-routes.js";
import { createIngredientRepository } from "./repositories/ingredient-repository.js";
import { createIngredientService } from "./services/ingredients-service.js";
import { createIngredientController } from "./controllers/ingredients-controller.js";

const prefix = `${applicationVariables.applicationName}/api/${applicationVariables.version}`;

// get env variables from .env file only when ENVIRONMENT=local
if (process.env.ENVIRONMENT === "local") {
  const dotenv = await import("dotenv");
  dotenv.config();
}
//todo test calls/connection to database on local and set up a test? also refactor tests to be consistne t wit test data on local db

// ==== create server instance ====
export default function buildServer() {
  const fastify = Fastify({
    logger: configureLogger(),
    exposeHeadRoutes: false,
    requestIdHeader: "correlation-id", // take this header as reqId
    requestIdLogLabel: "correlation-id", // rename reqId in logs to this value
  });
  const log = fastify.log.child({ module: "app" });

  // === Setup DB and services ===
  const databaseConfig = {
    connectionString: process.env.DATABASE_URL,
  };
  const database = createDatabase(databaseConfig);
  const ingredientRepository = createIngredientRepository(database);
  const ingredientService = createIngredientService(ingredientRepository);
  const ingredientController = createIngredientController(ingredientService);

  // ==== configure server ====
  // registerErrorHandler(fastify, log);
  registerDecorators(fastify, log);
  registerHooks(fastify, log);
  registerPlugins(fastify, log);
  registerRoutes(fastify, log, schemas, { ingredient: ingredientController });
  registerValidation(fastify, log);

  return fastify;
}

// ==== helper functions ====
// // todo add error handler and docstring and refactor below
// function registerErrorHandler(fastify, log) {
//   fastify.setErrorHandler((err, request, reply) => {
//     request.log.error(err, "Unhandled error");
//     reply.code(500).send({ error: "Internal Server Error" });
//   });
//
//   log.info("Registered error handler");
// }

/**
 * Registers custom Fastify decorators.
 *
 * Adds `applicationVariables` as a getter to all Fastify requests,
 * allowing structured access to application configuration across hooks,
 * controllers, and plugins.
 */
function registerDecorators(fastify, log) {
  fastify.decorate("applicationVariables", {
    getter() {
      return applicationVariables;
    },
  });
  log.info("Registered decorators");
}

/**
 * Registers Fastify lifecycle hooks.
 *
 * - `onSend`: Executes before the response is sent to the client.
 * - `preValidation`: Runs before schema validation, useful for input cleanup or auth.
 * - `onReady`: Executes after all routes and plugins have been registered.
 */
function registerHooks(fastify, log) {
  fastify.addHook("onSend", async (request, reply, payload) => {
    onSendHook(request, reply, payload);
  });
  fastify.addHook("preValidation", async (request, reply) => {
    preValidationHook(request, reply);
  });
  fastify.addHook("onReady", async () => {
    onReadyHook(fastify);
  });
  log.info("Registered hooks");
}

/**
 * Registers third-party Fastify plugins.
 *
 * Includes:
 * - `fastify-healthcheck`: Adds a health check route for readiness/liveness probes.
 */
function registerPlugins(fastify, log) {
  fastify.register(import("fastify-healthcheck"), {
    logLevel: "warn",
    healthcheckUrl: `/${prefix}/health/check`,
  });
  log.info("Registered plugins");
}

/**
 * Registers application routes.
 *
 * Includes:
 * - `ingredientRoutes`: All ingredient-related API endpoints, mounted with the specified prefix.
 */
function registerRoutes(fastify, log, schemas, controllers) {
  //todo refactor to allow more controllers?
  fastify.register(ingredientRoutes, {
    prefix: prefix,
    schemas: schemas,
    controller: controllers.ingredient, // injected dependency
  });
  log.info("Registered routes");
}

/**
 * Configures request/response validation using AJV.
 *
 * Sets custom AJV options including:
 * - `useDefaults`: Populate missing defaults in schemas.
 * - `nullable`: Enables support for `null` types in schemas.
 * - `allErrors`: Report all validation issues at once.
 *
 * Binds the AJV compiler to Fastify’s schema validation mechanism.
 */
function registerValidation(fastify, log) {
  const ajv = new Ajv({
    removeAdditional: false,
    useDefaults: true,
    coerceTypes: false,
    allErrors: true,
    nullable: true,
  });
  fastify.setValidatorCompiler(({ schema }) => ajv.compile(schema));
  log.info("Registered validation");
}
