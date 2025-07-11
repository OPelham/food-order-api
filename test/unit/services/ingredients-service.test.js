import t from "tap";
import sinon from "sinon";
import { createIngredientService } from "../../../src/services/ingredients-service.js";
import { Ingredient } from "../../../src/domain/ingredient.js";

t.test("Ingredient Service", async (t) => {
  const mockRepository = {
    findById: sinon.stub(),
  };

  const fakeRecord = { id: "123", name: "Salt", quantity: 10 };
  const expectedDTO = new Ingredient(fakeRecord).toDTO();

  const mockLog = {
    child: sinon.stub().returnsThis(),
    debug: sinon.stub(),
  };

  const service = createIngredientService(mockRepository);

  t.test("getById: should return ingredient DTO if found", async (t) => {
    mockRepository.findById.resolves(fakeRecord);

    const result = await service.getById("123", mockLog);

    t.same(result, expectedDTO, "should return DTO from domain entity");
    t.ok(
      mockRepository.findById.calledOnceWith("123", mockLog),
      "calls repository with correct args",
    );
    t.ok(
      mockLog.child.calledOnceWith({ module: "ingredient-service" }),
      "creates child logger",
    );
    t.ok(mockLog.debug.calledOnceWith("test log"), "logs debug message");
  });

  t.test("getById: should throw error if ingredient not found", async (t) => {
    mockRepository.findById.resolves(null);

    try {
      await service.getById("missing-id", mockLog);
      t.fail("should have thrown");
    } catch (err) {
      t.equal(
        err.message,
        "Ingredient not found",
        "throws correct error message",
      );
    }
  });
});
