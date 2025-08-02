import t from "tap";
import sinon from "sinon";
import { createIngredientRepository } from "../../../src/repositories/ingredient-repository.js";
import fs from "node:fs";
import { Ingredient } from "../../../src/domain/ingredient.js";
import { createIngredientService } from "../../../src/services/ingredients-service.js";

// import mocks
const mockDatabaseResponseJSON = fs.readFileSync(
  "./test/stubs/get-ingredient-by-id/postgres-database-response-success.json",
  "utf8",
);
const mockIngredientRepositoryOutputJSON = fs.readFileSync(
  "./test/stubs/get-ingredient-by-id/postgres-ingredient-repository-output-success.json",
  "utf8",
);
const mockDatabaseResponse = JSON.parse(mockDatabaseResponseJSON);
const mockIngredientRepositoryOutput = JSON.parse(
  mockIngredientRepositoryOutputJSON,
);

t.test("Ingredient Repository", async (t) => {
  const mockDb = {
    query: sinon.stub(),
  };

  const mockLog = {
    child: sinon.stub().returnsThis(),
    debug: sinon.stub(),
    error: sinon.stub(),
  };

  const repository = createIngredientRepository(mockDb);

  t.test("findById: returns result when found", async (t) => {
    mockDb.query.resolves(mockDatabaseResponse);
    const result = await repository.findById(
      mockIngredientRepositoryOutput.ingredientId,
      mockLog,
    );

    t.same(
      result,
      mockIngredientRepositoryOutput,
      "should return first row from DB",
    );
    t.ok(
      mockDb.query.calledOnceWith(
        "SELECT * FROM ingredients WHERE ingredient_id = $1",
        [mockIngredientRepositoryOutput.ingredientId],
      ),
      "should call DB with correct query and params",
    );
    t.ok(
      mockLog.child.calledOnceWith({
        module: "ingredient-repository-findById",
      }),
      "should use child logger",
    );
    t.ok(
      mockLog.debug.calledOnceWith({
        databaseResponseRows: mockDatabaseResponse.rows,
      }),
      "should log debug message",
    );
  });

  t.test("findById: returns null when not found", async (t) => {
    mockDb.query.resolves({ rowCount: 0, rows: [] });

    const result = await repository.findById("not-found", mockLog);

    t.equal(result, null, "should return null if no rows returned");
  });

  t.test("findById: logs and throws on DB error", async (t) => {
    const fakeError = new Error("Simulated DB error");
    mockDb.query.rejects(fakeError);

    try {
      await repository.findById("fail-id", mockLog);
      t.fail("Should have thrown");
    } catch (err) {
      t.equal(err.statusCode, 500, "should throw internal server error");

      t.match(
        mockLog.error.firstCall.args[0],
        {
          error: fakeError,
          ingredientId: "fail-id",
          context: "Database error in findById",
        },
        "should log error with context",
      );
    }
  });

  async function addIngredient(ingredient, log) {
    const childLog = log.child({
      module: "ingredient-repository-addIngredient",
    });
    try {
      childLog.debug({ ingredient }, "Adding new ingredient");

      await db.query(
        "INSERT INTO ingredients (ingredient_id, name, quantity, category) VALUES ($1, $2, $3, $4)",
        [
          ingredient.ingredientId,
          ingredient.name,
          ingredient.quantity,
          ingredient.category,
        ],
      );

      return { ok: true };
    } catch (error) {
      childLog.error({ error, context: "Database error in addIngredient" });
      const err = new Error("Internal Server Error");
      err.statusCode = 500;
      throw err;
    }
  }

  t.test("addIngredient: inserts ingredient successfully", async (t) => {
    const mockDb = {
      query: sinon.stub().resolves(),
    };

    const mockLog = {
      child: sinon.stub().returnsThis(),
      debug: sinon.stub(),
      error: sinon.stub(),
    };

    const repository = createIngredientRepository(mockDb);

    const ingredient = {
      ingredientId: "abc-123",
      name: "Cheese",
      quantity: 5,
      category: "CHILLED",
    };

    await repository.addIngredient(ingredient, mockLog);

    t.ok(mockDb.query.calledOnce, "should call DB");
    t.ok(
      mockLog.child.calledOnceWith({
        module: "ingredient-repository-addIngredient",
      }),
      "should use child logger",
    );
    t.ok(mockLog.debug.calledOnce, "should log debug");
  });

  t.test(
    "addIngredient: throws conflict error on duplicate key (23505)",
    async (t) => {
      const mockDb = {
        query: sinon.stub().rejects({
          code: "23505",
          message: "duplicate key value violates unique constraint",
        }),
      };

      const mockLog = {
        child: sinon.stub().returnsThis(),
        debug: sinon.stub(),
        error: sinon.stub(),
      };

      const repository = createIngredientRepository(mockDb);

      const ingredient = {
        ingredientId: "duplicate-id",
        name: "Cheese",
        quantity: 5,
        category: "CHILLED",
      };

      try {
        await repository.addIngredient(ingredient, mockLog);
        t.fail("Expected conflict error");
      } catch (err) {
        t.equal(err.statusCode, 409, "throws 409 Conflict");
        t.match(
          err.message,
          "Ingredient Already Exists",
          "has expected error message",
        );
      }
    },
  );

  t.test("addIngredient: adds ingredient and returns ID", async (t) => {
    const mockIngredientDTO = {
      ingredientId: "1234-abcd",
      name: "Tomato",
      quantity: 3,
      category: "FRESH",
    };

    const mockIngredient = {
      ingredientId: "1234-abcd",
      toDTO: sinon.stub().returns(mockIngredientDTO),
    };

    const mockRepository = {
      addIngredient: sinon.stub().resolves(),
    };

    const mockLog = {
      child: sinon.stub().returnsThis(),
      debug: sinon.stub(),
      error: sinon.stub(),
    };

    const fromRecordStub = sinon
      .stub(Ingredient, "fromRecord")
      .returns(mockIngredient);

    const service = createIngredientService(mockRepository);

    const result = await service.addIngredient(mockIngredientDTO, mockLog);

    t.same(
      result,
      { ingredientId: "1234-abcd" },
      "returns correct ingredientId",
    );
    t.ok(
      mockRepository.addIngredient.calledOnceWith(mockIngredientDTO, mockLog),
      "calls repository with DTO and logger",
    );

    fromRecordStub.restore();
  });

  t.test("addIngredient: throws if fromRecord returns undefined", async (t) => {
    const mockIngredientDTO = {
      ingredientId: "1234-abcd",
      name: "Carrot",
      quantity: 5,
      category: "CHILLED",
    };

    const mockRepository = {
      addIngredient: sinon.stub().resolves({ id: "1234-abcd" }), // simulate DB insert result
    };

    const mockLog = {
      child: sinon.stub().returnsThis(),
      debug: sinon.stub(),
      error: sinon.stub(),
    };

    // Make fromRecord return undefined
    const fromRecordStub = sinon
      .stub(Ingredient, "fromRecord")
      .returns(undefined);

    const service = createIngredientService(mockRepository);

    try {
      await service.addIngredient(mockIngredientDTO, mockLog);
      t.fail("Expected error was not thrown");
    } catch (err) {
      t.match(
        err.message,
        "Cannot read properties of undefined (reading 'ingredientId')",
        "Throws error if fromRecord returns undefined",
      );
    }

    fromRecordStub.restore();
  });

  t.test("addIngredient: returns undefined id if record is null", async (t) => {
    const result = await repository.addIngredient(null, mockLog);

    t.same(
      result,
      { ingredientId: undefined },
      "returns undefined ingredientId when input is null",
    );
  });

  // t.test("addIngredient: throws 500 if repository throws unknown error", async (t) => {
  //   const mockRepository = {
  //     addIngredient: sinon.stub().rejects(new Error("Unexpected failure")),
  //   };
  //
  //   const service = createIngredientService(mockRepository);
  //
  //   const mockLog = {
  //     child: sinon.stub().returnsThis(),
  //     error: sinon.stub(),
  //   };
  //
  //   const mockIngredientDTO = {
  //     name: "Onion",
  //     quantity: 2,
  //     category: "CHILLED",
  //   };
  //
  //   try {
  //     await service.addIngredient(mockIngredientDTO, mockLog);
  //     t.fail("Expected internal server error to be thrown");
  //   } catch (err) {
  //     t.equal(err.statusCode, 500, "Throws 500 Internal Server Error");
  //     t.match(err.message, /Internal Server Error/i, "Error message is generic");
  //     t.ok(mockLog.error.calledOnce, "Logs the unexpected error");
  //     t.match(
  //       mockLog.error.firstCall.args[0].message,
  //       "Unexpected failure",
  //       "Logs the original unexpected error message"
  //     );
  //   }
  // });
});
