const env = require('../config/env');
const { GEO_STATUS } = require('../utils/constants');
const { isPrivateOrLocal, normalizeIp } = require('../utils/ip.utils');

async function resolveGeoIp(rawIp) {
    const ip = normalizeIp(rawIp);
    if (isPrivateOrLocal(ip)) {
        return { geoStatus: GEO_STATUS.SKIPPED, enrichmentMs: 0, data: null };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), env.GEOIP_TIMEOUT_MS);
    const start = Date.now();

    try {
        const response = await fetch(`http://ip-api.com/json/${encodeURIComponent(ip)}`, {
            signal: controller.signal,
            headers: { 'Accept': 'application/json' }
        });

        const enrichmentMs = Date.now() - start;

        if (response.status === 429) {
            return { geoStatus: GEO_STATUS.RATE_LIMITED, enrichmentMs, data: null };
        }
        if (!response.ok) {
            return { geoStatus: GEO_STATUS.PROVIDER_ERROR, enrichmentMs, data: null };
        }

        const data = await response.json();
        if (data.status !== 'success') {
            return { geoStatus: GEO_STATUS.INVALID_RESPONSE, enrichmentMs, data: null };
        }

        return {
            geoStatus: GEO_STATUS.SUCCESS,
            enrichmentMs,
            data: {
                isp: data.isp,
                city: data.city,
                region: data.regionName,
                country: data.country
            }
        };
    } catch (err) {
        const enrichmentMs = Date.now() - start;
        return {
            geoStatus: err.name === 'AbortError' ? GEO_STATUS.TIMEOUT : GEO_STATUS.NETWORK_ERROR,
            enrichmentMs,
            data: null
        };
    } finally {
        clearTimeout(timer);
    }
}

module.exports = { resolveGeoIp };