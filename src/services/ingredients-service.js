import ingredientRepository from '../repositories/ingredient-repository.js';
import { Ingredient } from '../domain/ingredient.js';

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