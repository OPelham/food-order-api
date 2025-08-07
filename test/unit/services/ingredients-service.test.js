import t from "tap";
import sinon from "sinon";
import { createIngredientService } from "../../../src/services/ingredients-service.js";
import { Ingredient } from "../../../src/domain/ingredient.js";
import fs from "node:fs";
import { InvalidIngredientError } from "../../../src/lib/invalid-ingredient-error.js";

// import mocks
const mockIngredientRepositoryOutputJSON = fs.readFileSync(
  "./test/stubs/common/postgres-ingredient-repository-output-success.json",
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

    const result = await service.getIngredientById(
      mockRecord.ingredientId,
      mockLog,
    );

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
      await service.getIngredientById("missing-id", mockLog);
      t.fail("should have thrown");
    } catch (err) {
      t.equal(
        err.message,
        "Ingredient with id missing-id not found",
        "throws correct error message",
      );
    }
  });

  t.test("addIngredient: should return ingredientId on success", async (t) => {
    const mockAddIngredientDTO = {
      ingredientId: "a1111111-1111-1111-1111-111111111111",
      name: "Test Ingredient",
      quantity: 10,
      category: "CHILLED",
    };

    const mockRepositoryWithAdd = {
      addIngredient: sinon.stub().resolves(),
    };

    const serviceWithAdd = createIngredientService(mockRepositoryWithAdd);

    const result = await serviceWithAdd.addIngredient(
      mockAddIngredientDTO,
      mockLog,
    );

    t.same(
      result,
      { ingredientId: mockAddIngredientDTO.ingredientId },
      "should return ingredientId from DTO",
    );
    t.ok(
      mockRepositoryWithAdd.addIngredient.calledOnceWith(
        mockAddIngredientDTO,
        mockLog,
      ),
      "calls repository.addIngredient with correct args",
    );
  });

  t.test(
    "addIngredient: should throw 400 for invalid ingredient data",
    async (t) => {
      const invalidIngredient = { invalid: true };

      // Stub Ingredient.fromRecord to throw InvalidIngredientError
      const stub = sinon.stub(Ingredient, "fromRecord");
      stub.throws(new InvalidIngredientError("Invalid input"));

      const service = createIngredientService({
        addIngredient: sinon.stub(),
      });

      try {
        await service.addIngredient(invalidIngredient, mockLog);
        t.fail("should throw badRequest");
      } catch (err) {
        t.equal(err.statusCode, 400, "throws 400 Bad Request");
        t.match(
          err.message,
          /Invalid input/,
          "returns validation error message",
        );
      }

      stub.restore();
    },
  );

  t.test("addIngredient: should throw 500 on unexpected error", async (t) => {
    const invalidInput = { causeUnknownCrash: true };

    const stub = sinon.stub(Ingredient, "fromRecord");
    stub.throws(new Error("Unexpected"));

    const service = createIngredientService({
      addIngredient: sinon.stub(),
    });

    const errorLog = {
      ...mockLog,
      error: sinon.stub(),
    };

    try {
      await service.addIngredient(invalidInput, errorLog);
      t.fail("should throw 500");
    } catch (err) {
      t.equal(err.statusCode, 500, "throws 500 Internal Server Error");
      t.match(
        err.message,
        /Internal Server Error/,
        "returns default error message",
      );
      t.ok(errorLog.error.calledOnce, "logs unexpected error");
    }

    stub.restore();
  });
});
