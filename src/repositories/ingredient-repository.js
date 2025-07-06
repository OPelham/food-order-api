import db from '../infrastructure/database.js';

export default {
    async findById(id) {
        const res = await db.query('SELECT * FROM ingredients WHERE id = $1', [id]);
        return res.rows[0] || null;
    },

    async update(ingredient) {
        await db.query(
            'UPDATE ingredients SET quantity = $1 WHERE id = $2',
            [ingredient.quantity, ingredient.id]
        );
    },
};