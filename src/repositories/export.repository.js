const db = require("../config/database.js");
const QueryStream = require('pg-query-stream');

async function getScanLogColumns() {
    const query = `SELECT * FROM scan_logs LIMIT 0`;

    const result = await db.query(query);
    return result.fields.map(f => f.name);
}

async function streamScanLogs({ limit, days }) {
    const client = await db.pool.connect();

    const sql = `
        SELECT * FROM scan_logs
        WHERE ($1::int IS NULL OR scanned_at >= NOW() - make_interval(days => $1::int))
        ORDER BY scanned_at DESC
        LIMIT $2;
    `;
    const stream = client.query(new QueryStream(sql, [days, limit], { batchSize: 500 }));

    return { client, stream };
}

module.exports = { getScanLogColumns, streamScanLogs };
