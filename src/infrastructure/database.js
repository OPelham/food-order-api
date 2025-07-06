import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL, //todo establish how to populate
});

export default {
    query: (text, params) => pool.query(text, params),
};
