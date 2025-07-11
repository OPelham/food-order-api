import t from "tap";
import { Ingredient } from "../../../src/domain/ingredient.js";

const validIngredientId = "57526bf4-7226-4195-b5d6-0219923f65b1";

t.test("Ingredient domain entity", (t) => {
  t.test("constructor assigns properties", (t) => {
    const data = {
      ingredientId: validIngredientId,
      name: "Tomato",
      quantity: 1,
      category: "FROZEN",
    };
    const ingredient = new Ingredient(data);

    t.equal(ingredient.ingredientId, validIngredientId);
    t.equal(ingredient.name, "Tomato");
    t.equal(ingredient.quantity, 1);
    t.equal(ingredient.category, "FROZEN");
    t.end();
  });

  t.test("fromRecord creates an Ingredient instance from plain object", (t) => {
    const record = {
      ingredientId: validIngredientId,
      name: "Tomato",
      quantity: 1,
      category: "FROZEN",
    };
    const ingredient = Ingredient.fromRecord(record);

    t.ok(ingredient instanceof Ingredient);
    t.equal(ingredient.ingredientId, validIngredientId);
    t.equal(ingredient.name, "Tomato");
    t.equal(ingredient.quantity, 1);
    t.equal(ingredient.category, "FROZEN");
    t.end();
  });

  t.test("setQuantity updates quantity when positive", (t) => {
    const ingredient = new Ingredient({
      ingredientId: validIngredientId,
      name: "Tomato",
      quantity: 1,
      category: "FROZEN",
    });
    ingredient.setQuantity(10);

    t.equal(ingredient.quantity, 10);
    t.end();
  });

  t.test("setQuantity throws when quantity is negative", (t) => {
    const ingredient = new Ingredient({
      ingredientId: validIngredientId,
      name: "Tomato",
      quantity: 1,
      category: "FROZEN",
    });

    t.throws(() => {
      ingredient.setQuantity(-1);
    }, new Error("Quantity cannot be negative"));

    t.end();
  });

  t.test("toDTO returns correct plain object", (t) => {
    const ingredient = new Ingredient({
      ingredientId: validIngredientId,
      name: "Tomato",
      quantity: 1,
      category: "FROZEN",
    });
    const dto = ingredient.toDTO();

    t.same(dto, {
      ingredientId: validIngredientId,
      name: "Tomato",
      quantity: 1,
      category: "FROZEN",
    });

    //todo add tests for where not all are set, and test enums

    t.end();
  });
  t.end();
});
