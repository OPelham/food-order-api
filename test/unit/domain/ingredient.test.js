import t from "tap";
import { Ingredient } from "../../../src/domain/ingredient.js";
import fs from "node:fs";

// import mocks
const mockIngredientJSON = fs.readFileSync(
  "./test/stubs/get-ingredient-by-id/ingredientDTO.json",
  "utf8",
);
const mockIngredientRepositoryOutputJSON = fs.readFileSync(
  "./test/stubs/get-ingredient-by-id/postgres-ingredient-repository-output-success.json",
  "utf8",
);
const mockIngredient = JSON.parse(mockIngredientJSON);
const mockIngredientRepositoryOutput = JSON.parse(
  mockIngredientRepositoryOutputJSON,
);

t.test("Ingredient domain entity", (t) => {
  t.test("constructor assigns properties", (t) => {
    const ingredient = new Ingredient(mockIngredient);

    t.equal(ingredient.ingredientId, mockIngredient.ingredientId);
    t.equal(ingredient.name, mockIngredient.name);
    t.equal(ingredient.quantity, mockIngredient.quantity);
    t.equal(ingredient.category, mockIngredient.category);
    t.end();
  });

  t.test("fromRecord creates an Ingredient instance from plain object", (t) => {
    const ingredient = Ingredient.fromRecord(mockIngredientRepositoryOutput);

    t.ok(ingredient instanceof Ingredient);
    t.equal(ingredient.ingredientId, mockIngredient.ingredientId);
    t.equal(ingredient.name, mockIngredient.name);
    t.equal(ingredient.quantity, mockIngredient.quantity);
    t.equal(ingredient.category, mockIngredient.category);
    t.end();
  });

  t.test("setQuantity updates quantity when positive", (t) => {
    const ingredient = new Ingredient(mockIngredient);
    ingredient.setQuantity(10);

    t.equal(ingredient.quantity, 10);
    t.end();
  });

  t.test("setQuantity throws when quantity is negative", (t) => {
    const ingredient = new Ingredient(mockIngredient);

    t.throws(() => {
      ingredient.setQuantity(-1);
    }, new Error("Quantity cannot be negative"));

    t.end();
  });

  t.test("toDTO returns correct plain object", (t) => {
    const ingredient = new Ingredient(mockIngredient);
    const dto = ingredient.toDTO();

    t.same(dto, mockIngredient);

    //todo add tests for where not all are set, and test enums

    t.end();
  });
  t.end();
});
