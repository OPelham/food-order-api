export class Ingredient {
  constructor({ ingredientid, name, quantity, category }) {
    this.ingredientId = ingredientid;
    this.name = name;
    this.quantity = quantity;
    this.category = category;
  }

  static fromRecord(record) {
    return new Ingredient(record);
  }

  setQuantity(qty) {
    if (qty < 0) throw new Error("Quantity cannot be negative");
    this.quantity = qty;
  }

  toDTO() {
    return {
      ingredientId: this.ingredientId,
      name: this.name,
      quantity: this.quantity,
      category: this.category,
    };
  }
}
