import t from "tap";
import sinon from "sinon";
import { createIngredientController } from "../../../src/controllers/ingredients-controller.js";
import fs from "node:fs";

// import mocks
const mockIngredientJSON = fs.readFileSync(
  "./test/stubs/get-ingredient-by-id/ingredientDTO.json",
  "utf8",
);
const mockIngredient = JSON.parse(mockIngredientJSON);

t.test("Ingredient Controller - getIngredientById", async (t) => {
  const sandbox = sinon.createSandbox();

  const mockService = {
    getById: sandbox.stub(),
  };

  const controller = createIngredientController(mockService);

  t.teardown(() => sandbox.restore());

  t.test("responds with 200 and ingredient when found", async (t) => {
    mockService.getById.resolves(mockIngredient);

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
      mockService.getById.calledOnceWith(
        mockIngredient.ingredientId,
        request.log,
      ),
    );
    t.same(reply.send.firstCall.args[0], mockIngredient);
  });

  t.test(
    'responds with 404 if service throws "Ingredient not found"',
    async (t) => {
      const error = new Error("Ingredient not found");
      mockService.getById.rejects(error);

      const request = {
        params: { ingredientId: "missing-id" },
        log: {
          child: () => ({ info: () => {}, debug: () => {}, error: () => {} }),
        },
      };

      const reply = {
        code: sinon.stub().returnsThis(),
        send: sinon.spy(),
      };

      await controller.getIngredientById(request, reply);

      t.ok(reply.code.calledWith(404));
      t.same(reply.send.firstCall.args[0], { error: "Ingredient not found" });
    },
  );

  t.test("responds with 500 for unknown errors and logs them", async (t) => {
    const error = new Error("Database down");
    mockService.getById.rejects(error);

    const errorLogger = {
      debug: () => {},
      error: sinon.spy(),
    };

    const request = {
      params: { ingredientId: mockIngredient.ingredientId },
      log: { child: () => errorLogger },
    };

    const reply = {
      code: sinon.stub().returnsThis(),
      send: sinon.spy(),
    };

    await controller.getIngredientById(request, reply);

    t.ok(reply.code.calledWith(500));
    t.same(reply.send.firstCall.args[0], { error: "Internal Server Error" });
    t.ok(errorLogger.error.calledWith(error));
  });
});
