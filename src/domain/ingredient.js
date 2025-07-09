export class Ingredient {
  constructor({ id, name, quantity }) {
    this.id = id;
    this.name = name;
    this.quantity = quantity;
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
      id: this.id,
      name: this.name,
      quantity: this.quantity,
    };
  }
}
