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
     * @param {string} id - Ingredient ID
     * @returns {Promise<Object|null>} Ingredient record or null
     */
    async findById(id, log) {
      const repositoryLog = log.child({ module: "ingredient-repository" });
      repositoryLog.debug("test log");
      const result = await db.query("SELECT * FROM ingredients WHERE id = $1", [
        id,
      ]);
      console.log("result", result); //todo remove
      return result.rows[0] ?? null;
    },
  };
}
