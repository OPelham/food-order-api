import t from "tap";
import sinon from "sinon";
import { createIngredientController } from "../../../src/controllers/ingredients-controller.js";

t.test("Ingredient Controller - getIngredientById", async (t) => {
  const sandbox = sinon.createSandbox();

  const mockService = {
    getById: sandbox.stub(),
  };

  const controller = createIngredientController(mockService);

  t.teardown(() => sandbox.restore());

  t.test("responds with 200 and ingredient when found", async (t) => {
    const fakeIngredient = { id: "abc123", name: "Tomato" };
    mockService.getById.resolves(fakeIngredient);

    const request = {
      params: { ingredientId: "abc123" },
      log: { child: () => ({ info: () => {} }) },
    };

    const reply = {
      send: sinon.spy(),
    };

    await controller.getIngredientById(request, reply);

    t.ok(mockService.getById.calledOnceWith("abc123", request.log));
    t.same(reply.send.firstCall.args[0], fakeIngredient);
  });

  t.test(
    'responds with 404 if service throws "Ingredient not found"',
    async (t) => {
      const error = new Error("Ingredient not found");
      mockService.getById.rejects(error);

      const request = {
        params: { ingredientId: "missing-id" },
        log: { child: () => ({ info: () => {} }) },
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
      info: () => {},
      error: sinon.spy(),
    };

    const request = {
      params: { ingredientId: "abc123" },
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
