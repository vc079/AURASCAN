require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 3000,
    DB_USER: process.env.DB_USER || 'postgres',
    DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: parseInt(process.env.DB_PORT || '5432', 10),
    DB_NAME: process.env.DB_NAME || 'inspiro_db',
    ALLOWED_HOST: process.env.ALLOWED_HOST || 'localhost:3000',
    ENFORCE_ALLOWLIST: process.env.ENFORCE_ALLOWLIST === 'true',
    GEOIP_TIMEOUT_MS: parseInt(process.env.GEOIP_TIMEOUT_MS || '2500', 10),
    TRUST_PROXY_HOPS: parseInt(process.env.TRUST_PROXY_HOPS || '1', 10)
};