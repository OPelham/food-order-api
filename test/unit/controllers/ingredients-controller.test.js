import t from "tap";
import sinon from "sinon";
import { createIngredientController } from "../../../src/controllers/ingredients-controller.js";
import fs from "node:fs";

// import mocks
const mockIngredientJSON = fs.readFileSync(
  "./test/stubs/common/ingredientDTO.json",
  "utf8",
);
const mockIngredient = JSON.parse(mockIngredientJSON);
const mockIngredientsJSON = fs.readFileSync(
  "./test/stubs/get-ingredients-by-availability/available-ingredients-success.json",
  "utf8",
);
const mockIngredients = JSON.parse(mockIngredientsJSON);

t.test("Ingredient Controller - GET /ingredients/:ingredientId", async (t) => {
  const sandbox = sinon.createSandbox();
  const mockService = {
    getIngredientById: sandbox.stub(),
  };
  const controller = createIngredientController(mockService);

  t.teardown(() => sandbox.restore());

  t.test("responds with 200 and ingredient when found", async (t) => {
    mockService.getIngredientById.resolves(mockIngredient);

    const request = {
      params: { ingredientId: mockIngredient.ingredientId },
      log: {
        child: () => ({ info: () => {}, debug: () => {}, error: () => {} }),
      },
    };

    const reply = {
      send: sinon.spy(),
    };

    await controller.getIngredientById(request, reply);

    t.ok(
      mockService.getIngredientById.calledOnceWith(
        mockIngredient.ingredientId,
        request.log,
      ),
    );
    t.same(reply.send.firstCall.args[0], mockIngredient);
  });
});

t.test(
  "Ingredient Controller - GET /ingredients/findByAvailability",
  async (t) => {
    const sandbox = sinon.createSandbox();
    const mockService = {
      getIngredientsByAvailability: sandbox.stub(),
    };
    const controller = createIngredientController(mockService);

    t.teardown(() => sandbox.restore());

    t.test("responds with 200 and ingredients when found", async (t) => {
      mockService.getIngredientsByAvailability.resolves(mockIngredients);

      const request = {
        query: { availability: "AVAILABLE" },
        log: {
          child: () => ({ info: () => {}, debug: () => {}, error: () => {} }),
        },
      };

      const reply = {
        send: sinon.spy(),
      };

      await controller.getIngredientsByAvailability(request, reply);

      t.ok(
        mockService.getIngredientsByAvailability.calledOnceWith(
          "AVAILABLE",
          request.log,
        ),
      );
      t.same(reply.send.firstCall.args[0], mockIngredients);
    });
  },
);

t.test("Ingredient Controller - POST /ingredients", async (t) => {
  const sandbox = sinon.createSandbox();
  const mockService = {
    addIngredient: sandbox.stub(),
  };
  const controller = createIngredientController(mockService);

  t.teardown(() => sandbox.restore());

  t.test("successfully adds ingredient and returns response", async (t) => {
    const mockAddResponse = { ok: true };
    mockService.addIngredient.resolves(mockAddResponse);

    const request = {
      body: mockIngredient,
      log: {
        child: () => ({ info: () => {}, debug: () => {}, error: () => {} }),
      },
    };

    const reply = {
      send: sinon.spy(),
    };

    await controller.addIngredient(request, reply);

    t.ok(
      mockService.addIngredient.calledOnceWith(mockIngredient, request.log),
      "should call service.addIngredient with body and log",
    );
    t.same(
      reply.send.firstCall.args[0],
      mockAddResponse,
      "should reply with service response",
    );
  });
});
