const db = require('../config/database');

async function createScanLog(scanData) {
    const query = `
        INSERT INTO scan_logs (
            request_id, ip_address, isp, city, region, country,
            user_agent, referer, request_method, request_path,
            response_status, processing_duration_ms, quote_id, quote_served,
            geo_status, enrichment_ms
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING id;
    `;
    const values = [
        scanData.requestId,
        scanData.ipAddress,
        scanData.isp || null,
        scanData.city || null,
        scanData.region || null,
        scanData.country || null,
        scanData.userAgent || null,
        scanData.referer || null,
        scanData.requestMethod,
        scanData.requestPath,
        scanData.responseStatus,
        scanData.processingDurationMs,
        scanData.quoteId || null,
        scanData.quoteServed || null,
        scanData.geoStatus,
        scanData.enrichmentMs || null
    ];
    const { rows } = await db.query(query, values);
    return rows[0];
}

module.exports = { createScanLog };