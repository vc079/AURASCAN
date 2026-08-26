const db = require('../config/database');

class DashboardRepository {
    async getSummaryStats() {
        const [totalScans, osStats, browserStats, recentScans] = await Promise.all([
            // 1. Get total scan count
            db.query('SELECT COUNT(*) as total FROM scan_logs;'),
            
            // 2. Group by OS (Ignoring NULL values)
            db.query('SELECT os, COUNT(*) as count FROM scan_logs WHERE os IS NOT NULL GROUP BY os ORDER BY count DESC LIMIT 5;'),
            
            // 3. Group by Browser (Ignoring NULL values)
            db.query('SELECT browser, COUNT(*) as count FROM scan_logs WHERE browser IS NOT NULL GROUP BY browser ORDER BY count DESC LIMIT 5;'),
            
            // 4. Get the 5 most recent scans
            db.query('SELECT ip_address, city, country, os, browser, isp, scanned_at FROM scan_logs ORDER BY scanned_at DESC LIMIT 5;')
        ]);

        return {
            totalScans: parseInt(totalScans.rows[0].total),
            operatingSystems: osStats.rows,
            browsers: browserStats.rows,
            recentActivity: recentScans.rows
        };
    }
}

module.exports = new DashboardRepository();