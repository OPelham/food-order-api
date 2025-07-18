export class InvalidIngredientError extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidIngredientError";
  }
}
