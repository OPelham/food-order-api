import { randomUUID } from "node:crypto";
import { InvalidIngredientError } from "../lib/invalid-ingredient-error.js";

export class Ingredient {
  constructor({ ingredientId, name, quantity, category, availability }) {
    if (typeof quantity !== "number" || quantity < 0) {
      throw new InvalidIngredientError("Quantity cannot be less than 0");
    }

    this.ingredientId = ingredientId ?? randomUUID();
    this.name = name;
    this.quantity = quantity;
    this.category = category;
    this.availability = availability; // optional — may be undefined
  }

  static fromRecord(record) {
    return new Ingredient(record);
  }

  setQuantity(qty) {
    if (qty < 0)
      throw new InvalidIngredientError("Quantity cannot be less than 0");
    this.quantity = qty;
  }

  toDTO() {
    return {
      ingredientId: this.ingredientId,
      name: this.name,
      quantity: this.quantity,
      category: this.category,
      ...(this.availability !== undefined && {
        availability: this.availability,
      }),
      // spread used to add with && as conditional expression
      // if undefined then false returned
      // if defined then { availability: this.availability } returned
      // so ...{ availability: this.availability } adds object into current object
    };
  }
}
