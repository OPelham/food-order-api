import t from "tap";
import sinon from "sinon";
import { createIngredientRepository } from "../../../src/repositories/ingredient-repository.js";

t.test("Ingredient Repository", async (t) => {
  const mockDb = {
    query: sinon.stub(),
  };

  const mockLog = {
    child: sinon.stub().returnsThis(),
    debug: sinon.stub(),
  };

  const repository = createIngredientRepository(mockDb);

  t.test("findById: returns result when found", async (t) => {
    const fakeRecord = { id: "123", name: "Pepper", quantity: 7 };
    mockDb.query.resolves(fakeRecord);

    const result = await repository.findById("123", mockLog);

    t.same(result, fakeRecord, "should return first row from DB");
    t.ok(
      mockDb.query.calledOnceWith("SELECT * FROM ingredients WHERE id = $1", [
        "123",
      ]),
      "should call DB with correct query and params",
    );
    t.ok(
      mockLog.child.calledOnceWith({ module: "ingredient-repository" }),
      "should use child logger",
    );
    t.ok(mockLog.debug.calledOnceWith("test log"), "should log debug message");
  });

  t.test("findById: returns null when not found", async (t) => {
    mockDb.query.resolves(null);

    const result = await repository.findById("not-found", mockLog);

    t.equal(result, null, "should return null if no rows returned");
  });
});
