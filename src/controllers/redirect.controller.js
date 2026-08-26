const campaignRepo = require('../repositories/campaign.repository');
const analyticsWorker = require('../workers/analytics.worker');

// In-memory cache to track recent scans
const recentScans = new Map();
const COOLDOWN_PERIOD_MS = 15000; // 15 seconds

async function handleRedirect(req, res, next) {
    try {
        const { slug } = req.params;
        
        // 1. Get the IP Address instantly
        const clientIp = req.headers['x-forwarded-for'] 
            ? req.headers['x-forwarded-for'].split(',')[0].trim() 
            : req.ip;

        // 2. Build the cache key
        const cacheKey = `${clientIp}-${slug}`;
        const now = Date.now();
        
        // 3. SYNCHRONOUS LOCK: Check and lock the door BEFORE any async database calls
        let shouldLog = false;
        const lastScanTime = recentScans.get(cacheKey);

        if (!lastScanTime || (now - lastScanTime) > COOLDOWN_PERIOD_MS) {
            shouldLog = true; // This is the winner!
            
            // Lock the cache instantly so the next millisecond ping gets blocked
            recentScans.set(cacheKey, now);
            
            // Clean up memory after the cooldown ends
            setTimeout(() => recentScans.delete(cacheKey), COOLDOWN_PERIOD_MS + 1000);
        }

        // 4. Now we safely ask the database where to redirect them
        const campaign = await campaignRepo.findBySlug(slug);
        
        if (!campaign) {
            // If it's a bad link, remove the lock and return 404
            if (shouldLog) recentScans.delete(cacheKey);
            return res.status(404).send('<h1>404 - Campaign Link Not Found</h1>');
        }

        // 5. Process the log ONLY if it won the race
        if (shouldLog) {
            const durationMs = Date.now() - req.startTime;
            analyticsWorker.enqueue({
                requestId: req.requestId,
                method: req.method,
                ipAddress: clientIp,
                requestPath: req.originalUrl,
                userAgent: req.headers['user-agent'] || 'Unknown',
                referer: req.headers['referer'] || null,
                responseStatus: 302,
                durationMs: durationMs,
                campaignId: campaign.id,
                quoteServed: `Redirected to: ${campaign.target_url}`
            });
        } else {
            console.log(`🛡️ [Race Condition Blocked] Duplicate ping from: ${clientIp}`);
        }

        // 6. Always redirect them instantly
        return res.redirect(302, campaign.target_url);
    } catch (error) {
        next(error);
    }
}

module.exports = { handleRedirect };