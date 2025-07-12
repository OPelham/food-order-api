// import pg from "pg";
// const { Pool } = pg;
//
// /**
//  * Creates a PostgreSQL database interface.
//  * Called explicitly from app code to allow mocking in tests.
//  *
//  * @param {Object} config - Pool configuration
//  * @returns {Object} database interface
//  */
// export function createDatabase(config = {}) {
//   const pool = new Pool({
//     connectionString: config.connectionString,
//   });
//
//   return {
//     query: (text, params) => pool.query(text, params),
//     pool,
//   };
// }

import { Pool } from "pg"; // direct named import

export function createDatabase(config = {}) {
  const pool = new Pool({
    connectionString: config.connectionString,
  });

  return {
    query: (text, params) => pool.query(text, params),
    pool,
  };
}
