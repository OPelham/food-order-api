
export async function getIngredientById(request, reply) {
    try {
        const id = request.params.id;
        const ingredient = await ingredientService.getById(id);
        reply.send(ingredient);
    } catch (err) {
        reply.code(404).send({ error: err.message });
    }
}