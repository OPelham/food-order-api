import pg from 'pg';
const { Pool } = pg;

/**
 * Creates a singleton PostgreSQL connection pool.
 */
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

/**
 * Simple database interface exposing query method.
 */
const database = {
    /**
     * Executes a parameterized SQL query.
     *
     * @param {string} text - SQL query
     * @param {Array<any>} params - Parameters for query
     * @returns {Promise<QueryResult>} PostgreSQL query result
     */
    query: (text, params) => pool.query(text, params),

    /**
     * Exposes raw pool if needed for transactions or low-level control.
     */
    pool,
};

export default database;
