import { httpErrors } from "@fastify/sensible";

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
      try {
        const databaseResponse = await db.query(
          "SELECT * FROM ingredients WHERE ingredient_id = $1",
          [ingredientId],
        );

        repositoryLog.debug({ databaseResponseRows: databaseResponse?.rows });

        if (databaseResponse?.rows.length === 0) {
          return null;
        }

        const row = databaseResponse.rows[0];
        return {
          ingredientId: row.ingredient_id,
          name: row.name,
          quantity: row.quantity,
          category: row.category,
        };
      } catch (error) {
        //todo are there any db errors that need to be handled differently?
        repositoryLog.error({
          error,
          ingredientId,
          query: "SELECT * FROM ingredients WHERE ingredient_id = $1",
          context: "Database error in findById",
        });
        throw httpErrors.internalServerError(); //todo state database error or not?
      }
    },
  };
}
