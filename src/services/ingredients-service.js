import { Ingredient } from "../domain/ingredient.js";
import { httpErrors } from "@fastify/sensible";
import { InvalidIngredientError } from "../lib/invalid-ingredient-error.js";

/**
 * Creates the ingredient service that uses the repository and domain model.
 *
 * @param {Object} repository - Ingredient repository with data access methods
 * @returns {Object} Ingredient service API
 */
export function createIngredientService(repository) {
  return {
    /**
     * Gets an ingredient by its ID and returns it as a DTO.
     *
     * @param {string} id - Ingredient ID
     * @param log
     * @throws {Error} If ingredient is not found
     * @returns {Promise<Object>} Ingredient DTO
     */
    async getIngredientById(id, log) {
      const childLog = log.child({ module: "ingredient-service" });

      const record = await repository.findById(id, log); //todo try catch?
      childLog.debug({ record: record });
      if (!record) {
        //todo review cleaner way to handle errors
        throw httpErrors.notFound(`Ingredient with id ${id} not found`);
      }

      const ingredient = Ingredient.fromRecord(record);
      childLog.debug({ ingredientDTO: ingredient.toDTO() });
      return ingredient.toDTO();
    },

    /**
     * Gets an ingredient by its ID and returns it as a DTO.
     *
     * @param {string} addIngredientRequestBody - Request body from consumers request
     * @param log
     * @throws {Error} If ingredient is not found
     * @returns {Promise<Object>} Ingredient DTO
     */
    async addIngredient(addIngredientRequestBody, log) {
      const childLog = log.child({ module: "ingredient.service" });

      //todo transform or process request?
      let ingredient;

      try {
        ingredient = Ingredient.fromRecord(addIngredientRequestBody);
      } catch (err) {
        if (err instanceof InvalidIngredientError) {
          throw httpErrors.badRequest(err.message);
        }
        childLog.error(err); //todo how log this and what, do er need to log?
        throw httpErrors.internalServerError();
      }

      if (ingredient != null) {
        await repository.addIngredient(ingredient.toDTO(), log);
      }

      // todo only return this if db call succeeds, otherwise error
      return { ingredientId: ingredient.ingredientId }; //todo transform response
    },
  };
}
