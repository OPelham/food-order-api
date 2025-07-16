import t from "tap";
import sinon from "sinon";
import { createIngredientService } from "../../../src/services/ingredients-service.js";
import { Ingredient } from "../../../src/domain/ingredient.js";
import fs from "node:fs";

// import mocks
const mockIngredientRepositoryOutputJSON = fs.readFileSync(
  "./test/stubs/get-ingredient-by-id/postgres-ingredient-repository-output-success.json",
  "utf8",
);
const mockIngredientRepositoryOutput = JSON.parse(
  mockIngredientRepositoryOutputJSON,
);

t.test("Ingredient Service", async (t) => {
  const mockRepository = {
    findById: sinon.stub(),
  };

  const mockRecord = mockIngredientRepositoryOutput;
  const expectedDTO = new Ingredient(mockRecord).toDTO();

  const mockLog = {
    child: sinon.stub().returnsThis(),
    debug: sinon.stub(),
  };

  const service = createIngredientService(mockRepository);

  t.test("getById: should return ingredient DTO if found", async (t) => {
    mockRepository.findById.resolves(mockRecord);

    const result = await service.getById(mockRecord.ingredientId, mockLog);

    t.same(result, expectedDTO, "should return DTO from domain entity");
    t.ok(
      mockRepository.findById.calledOnceWith(mockRecord.ingredientId, mockLog),
      "calls repository with correct args",
    );
    t.ok(
      mockLog.child.calledOnceWith({ module: "ingredient-service" }),
      "creates child logger",
    );
    t.same(
      mockLog.debug.getCall(0).args[0],
      { record: mockRecord },
      "first debug call logs the record",
    );

    t.same(
      mockLog.debug.getCall(1).args[0],
      { ingredientDTO: expectedDTO },
      "second debug call logs the DTO",
    );
  });

  t.test("getById: should throw error if ingredient not found", async (t) => {
    mockRepository.findById.resolves(null);

    try {
      await service.getById("missing-id", mockLog);
      t.fail("should have thrown");
    } catch (err) {
      t.equal(
        err.message,
        "Ingredient with id missing-id not found",
        "throws correct error message",
      );
    }
  });
});
