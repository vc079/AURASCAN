const UAParser = require('ua-parser-js'); 
const db = require('../config/database');
const geoipService = require('../services/geoip.service');
const crypto = require('crypto'); // Added for random fallback ID

class AnalyticsWorker {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
    }

    enqueue(payload) {
        this.queue.push(payload);
        this.processQueue();
    }

    async processQueue() {
        if (this.isProcessing || this.queue.length === 0) return;
        this.isProcessing = true;

        while (this.queue.length > 0) {
            const payload = this.queue.shift();
            await this.processPayload(payload);
        }

        this.isProcessing = false;
    }

    async processPayload(payload) {
        try {
            let isp = 'Unknown', city = 'Unknown', country = 'Unknown', geoStatus = 'Local';
            
            if (payload.ipAddress) {
                const geoResult = await geoipService.resolveGeoIp(payload.ipAddress);
                geoStatus = geoResult.geoStatus;
                
                if (geoResult.data) {
                    isp = geoResult.data.isp || 'Unknown';
                    city = geoResult.data.city || 'Unknown';
                    country = geoResult.data.country || 'Unknown';
                }
            }

            const parser = new UAParser(payload.userAgent);
            const uaResult = parser.getResult();
            
            const browser = uaResult.browser.name || 'Unknown';
            const os = uaResult.os.name || 'Unknown';
            const deviceType = uaResult.device.type || 'Desktop'; 

           // ADDED request_method (17 total columns)
            const query = `
                INSERT INTO scan_logs (
                    request_id, ip_address, request_path, user_agent, referer,
                    response_status, response_time_ms, quote_served,
                    isp, city, country, geo_status, campaign_id,
                    browser, os, device_type, request_method
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
                RETURNING id;
            `;

            const values = [
                payload.requestId || crypto.randomUUID(),
                payload.ipAddress,
                payload.requestPath,
                payload.userAgent,
                payload.referer,
                payload.responseStatus,
                payload.durationMs,
                payload.quoteServed,
                isp,       
                city,
                country,
                geoStatus,
                payload.campaignId || null,
                browser,           
                os,                
                deviceType,
                payload.method || 'GET' // <--- The missing method
            ];

            await db.query(query, values);
            console.log(`[Analytics:Success] Logged scan for ${os} on ${browser}`);

        } catch (error) {
            console.error('[Analytics:Error] Failed to process payload:', error);
        }
    }
}

module.exports = new AnalyticsWorker();