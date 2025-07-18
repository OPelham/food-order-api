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
      const childLog = log.child({ module: "ingredient-repository-findById" });
      try {
        const databaseResponse = await db.query(
          "SELECT * FROM ingredients WHERE ingredient_id = $1",
          [ingredientId],
        );

        childLog.debug({ databaseResponseRows: databaseResponse?.rows });

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
        childLog.error({
          error,
          ingredientId,
          query: "SELECT * FROM ingredients WHERE ingredient_id = $1",
          context: "Database error in findById",
        });
        throw httpErrors.internalServerError(); //todo state database error or not?
      }
    },

    /**
     * Adds a new ingredient.
     *
     * @param {Object} ingredientDTO - Ingredient data
     * @param {string} ingredientDTO.ingredientId - UUID of the ingredient
     * @param {string} ingredientDTO.name - Ingredient name
     * @param {number} ingredientDTO.quantity - Quantity available
     * @param {string} ingredientDTO.category - Storage category
     * @param log
     * @returns {Promise<Object|null>} Ingredient record or null
     */
    async addIngredient(ingredientDTO, log) {
      const childLog = log.child({
        module: "ingredient-repository-addIngredient",
      });
      const { ingredientId, name, quantity, category } = ingredientDTO;

      try {
        await db.query(
          `
          INSERT INTO ingredients (ingredient_id, name, quantity, category)
          VALUES ($1, $2, $3, $4)
          `,
          [ingredientId, name, quantity, category],
        );
        childLog.debug(
          { ingredientId, name, quantity, category },
          "Ingredient added to database",
        );
      } catch (error) {
        childLog.error({
          error,
          ingredientId,
          name,
          quantity,
          category,
          query: "INSERT INTO ingredients ...",
          context: "Database error in addIngredient",
        });

        if (error.code === "23505") {
          throw httpErrors.conflict("Ingredient already exists");
        }
        throw httpErrors.internalServerError();
      }
    },
  };
}
