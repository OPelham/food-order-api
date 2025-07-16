import { Ingredient } from "../domain/ingredient.js";
import { httpErrors } from "@fastify/sensible";

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
     * @throws {Error} If ingredient is not found
     * @returns {Promise<Object>} Ingredient DTO
     */
    async getById(id, log) {
      const serviceLog = log.child({ module: "ingredient-service" });

      const record = await repository.findById(id, log);
      serviceLog.debug({ record: record });
      if (!record) {
        //todo review cleaner way to handle errors
        throw httpErrors.notFound(`Ingredient with id ${id} not found`);
      }

      const ingredient = Ingredient.fromRecord(record);
      serviceLog.debug({ ingredientDTO: ingredient.toDTO() });
      return ingredient.toDTO();
    },
  };
}
