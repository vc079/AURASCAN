const env = require("../config/env");
const crypto = require('crypto');

module.exports = (req, res, next) => {
    if (!env.ADMIN_API_KEY) {
        console.error(`[Auth] ADMIN_API_KEY not configured: refusing request ${req.requestId}`);
        return res.status(503).json({
            error: 'Export endpoint is not configured'
        });
    }

    const apiKey = req.get('x-api-key');
    if (!apiKey || typeof apiKey !== 'string') {
        return res.status(401).json({
            error: "Invalid API Key"
        });
    }

    const digest = (s) => crypto.createHash('sha256').update(String(s)).digest();
    const ok = crypto.timingSafeEqual(digest(apiKey), digest(env.ADMIN_API_KEY));
    if (!ok) {
        return res.status(401).json({
            error: 'Invalid API Key'
        });
    }

    return next();
};
