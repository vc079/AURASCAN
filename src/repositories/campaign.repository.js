const db = require('../config/database'); // Ensure this matches your actual db config filename

class CampaignRepository {
    async findBySlug(slug) {
        const query = `
            SELECT id, name, slug, target_url, is_active 
            FROM campaigns 
            WHERE slug = $1 AND is_active = TRUE;
        `;
        const result = await db.query(query, [slug]);
        return result.rows[0] || null;
    }

    async createCampaign(name, slug, targetUrl) {
        const query = `
            INSERT INTO campaigns (name, slug, target_url)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const result = await db.query(query, [name, slug, targetUrl]);
        return result.rows[0];
    }
}

module.exports = new CampaignRepository();