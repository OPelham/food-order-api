/**
 * Creates a concrete implementation of the Ingredient repository.
 * This abstracts database operations for ingredients and allows for substitution in tests.
 *
 * @param {Pool} db - A PostgreSQL client or pool instance.
 * @returns {Object} Repository interface with findById method.
 */
export function createIngredientRepository(db) {
  return {
    /**
     * Finds an ingredient by ID.
     *
     * @param {string} ingredientId - Ingredient ID
     * @param log
     * @returns {Promise<Object|null>} Ingredient record or null
     */
    async findById(ingredientId, log) {
      const repositoryLog = log.child({ module: "ingredient-repository" });
      const result = await db.query(
        "SELECT * FROM ingredients WHERE ingredient_id = $1",
        [ingredientId],
      );

      //todo make this a function and use dependency inversion to pass? this would make using other dbs later easier
      let transformedResult;
      if (result) {
        transformedResult = {
          ingredientId: result.rows[0].ingredient_id,
          name: result.rows[0].name,
          quantity: result.rows[0].quantity,
          category: result.rows[0].category,
        };
      }

      return transformedResult ?? null; //todo check this
    },
  };
}
