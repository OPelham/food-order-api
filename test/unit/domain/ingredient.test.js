import t from "tap";
import { Ingredient } from "../../../src/domain/ingredient.js";

t.test("Ingredient domain entity", (t) => {
  t.test("constructor assigns properties", (t) => {
    const data = { id: "1", name: "Tomato", quantity: 5 };
    const ingredient = new Ingredient(data);

    t.equal(ingredient.id, "1");
    t.equal(ingredient.name, "Tomato");
    t.equal(ingredient.quantity, 5);
    t.end();
  });

  t.test("fromRecord creates an Ingredient instance from plain object", (t) => {
    const record = { id: "2", name: "Cheese", quantity: 2 };
    const ingredient = Ingredient.fromRecord(record);

    t.ok(ingredient instanceof Ingredient);
    t.equal(ingredient.id, "2");
    t.equal(ingredient.name, "Cheese");
    t.equal(ingredient.quantity, 2);
    t.end();
  });

  t.test("setQuantity updates quantity when positive", (t) => {
    const ingredient = new Ingredient({ id: "3", name: "Basil", quantity: 1 });
    ingredient.setQuantity(10);

    t.equal(ingredient.quantity, 10);
    t.end();
  });

  t.test("setQuantity throws when quantity is negative", (t) => {
    const ingredient = new Ingredient({ id: "4", name: "Salt", quantity: 3 });

    t.throws(() => {
      ingredient.setQuantity(-1);
    }, new Error("Quantity cannot be negative"));

    t.end();
  });

  t.test("toDTO returns correct plain object", (t) => {
    const ingredient = new Ingredient({ id: "5", name: "Pepper", quantity: 7 });
    const dto = ingredient.toDTO();

    t.same(dto, {
      id: "5",
      name: "Pepper",
      quantity: 7,
    });

    t.end();
  });
  t.end();
});
