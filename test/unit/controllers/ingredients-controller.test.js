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
});
