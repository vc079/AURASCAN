const db = require('../config/database');

async function getRandomActiveQuote() {
    const query = `
        SELECT id, quote_text, author, category 
        FROM quotes 
        WHERE is_active = TRUE 
        ORDER BY random() 
        LIMIT 1;
    `;
    const { rows } = await db.query(query);
    return rows[0] || null;
}

module.exports = { getRandomActiveQuote };