const { Pool } = require('pg');
const env = require('./env');

const pool = new Pool({
    user: env.DB_USER,
    host: env.DB_HOST,
    database: env.DB_NAME,
    password: env.DB_PASSWORD,
    port: env.DB_PORT,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
    console.error('[DB] Unexpected error on idle client:', err.message);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};