import t from "tap";
import { Ingredient } from "../../../src/domain/ingredient.js";
import fs from "node:fs";
import { InvalidIngredientError } from "../../../src/lib/invalid-ingredient-error.js";

// import mocks
const mockIngredientJSON = fs.readFileSync(
  "./test/stubs/common/ingredientDTO.json",
  "utf8",
);
const mockIngredientMandatoryFieldsJSON = fs.readFileSync(
  "./test/stubs/common/ingredientDTOMandatoryFields.json",
  "utf8",
);
const mockIngredientRepositoryOutputJSON = fs.readFileSync(
  "./test/stubs/common/postgres-ingredient-repository-output-success.json",
  "utf8",
);
const mockIngredient = JSON.parse(mockIngredientJSON);
const mockIngredientMandatoryFields = JSON.parse(
  mockIngredientMandatoryFieldsJSON,
);
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

  t.test("constructor throws if quantity is not a number", (t) => {
    const badInput = { ...mockIngredient, quantity: "a lot" };

    t.throws(() => {
      new Ingredient(badInput);
    }, new InvalidIngredientError("Quantity cannot be less than 0"));

    t.end();
  });

  t.test("constructor uses provided ingredientId", (t) => {
    const customId = "my-custom-id-123";
    const ingredient = new Ingredient({
      ...mockIngredient,
      ingredientId: customId,
    });

    t.equal(ingredient.ingredientId, customId);
    t.end();
  });

  t.test("constructor generates UUID if ingredientId is undefined", (t) => {
    const { ingredientId, ...rest } = mockIngredient;
    const ingredient = new Ingredient(rest);

    t.match(
      ingredient.ingredientId,
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    ); // basic UUID v4 pattern
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
    }, new InvalidIngredientError("Quantity cannot be less than 0"));

    t.end();
  });

  t.test("toDTO returns correct plain object", (t) => {
    const ingredient = new Ingredient(mockIngredientMandatoryFields);
    const dto = ingredient.toDTO();

    t.same(dto, mockIngredientMandatoryFields);

    //todo add tests for where not all are set, and test enums

    t.end();
  });

  t.test("toDTO omits availability if undefined", (t) => {
    const { availability, ...partialIngredient } = mockIngredient;
    const ingredient = new Ingredient(partialIngredient);

    const dto = ingredient.toDTO();

    t.notOk("availability" in dto);
    t.end();
  });

  t.test("toDTO includes availability when defined", (t) => {
    const input = { ...mockIngredient, availability: "in-stock" };
    const ingredient = new Ingredient(input);
    const dto = ingredient.toDTO();

    t.equal(dto.availability, "in-stock");
    t.end();
  });

  t.end();
});
