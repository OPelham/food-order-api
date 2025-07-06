import ingredientRepository from '../repositories/ingredient-repository.js';
import { Ingredient } from '../domain/ingredient.js';

/**
 * Retrieves a single ingredient by its ID from the repository.
 *
 * - Delegates fetching to the ingredient repository.
 * - Converts the raw database record into a domain `Ingredient` entity.
 * - Returns a plain DTO suitable for response serialization.
 * - Throws an error if the ingredient is not found.
 *
 * @async
 * @param {string} ingredientId - The ID of the ingredient to retrieve.
 * @returns {Promise<Object>} The ingredient DTO.
 * @throws {Error} If the ingredient does not exist.
 */
export async function getById(ingredientId) {
    const record = await ingredientRepository.findById(ingredientId);
    if (!record) throw new Error('Ingredient not found');
    return Ingredient.fromRecord(record).toDTO();
}

export async function updateQuantity(ingredientId, newQuantity) {
    const record = await ingredientRepository.findById(ingredientId);
    if (!record) throw new Error('Ingredient not found');

    const ingredient = Ingredient.fromRecord(record);
    ingredient.setQuantity(newQuantity);
    await ingredientRepository.update(ingredient);
    return ingredient.toDTO();
}