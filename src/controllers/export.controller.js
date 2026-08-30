const env = require("../config/env");
const { format } = require("fast-csv");
const { getScanLogColumns, streamScanLogs } = require("../repositories/export.repository");
const { sanitizeCsvValues } = require("../utils/csv.utils");

// Express hands back a string, an array (?limit=1&limit=2) or an object (?limit[a]=1).
// parseInt would turn '10abc' into 10, so match the whole string before converting.
function parseIntParam(raw, { name, defaultValue, min, max }) {
    if (raw === undefined || raw === '') return defaultValue;

    if (typeof raw !== 'string' || !/^\d+$/.test(raw)) {
        const err = new Error(`Invalid '${name}': must be an integer between ${min} and ${max}`);
        err.status = 400;
        throw err;
    }

    const value = Number(raw);
    if (!Number.isSafeInteger(value) || value < min || value > max) {
        const err = new Error(`Invalid '${name}': must be an integer between ${min} and ${max}`);
        err.status = 400;
        throw err;
    }

    return value;
}

async function exportLogsCsv(req, res, next) {
    try {
        const limit = parseIntParam(req.query.limit, {
            name: 'limit',
            defaultValue: env.EXPORT_DEFAULT_LIMIT,
            min: 1,
            max: env.EXPORT_MAX_LIMIT
        });
        const days = parseIntParam(req.query.days, {
            name: 'days',
            defaultValue: null,
            min: 1,
            max: 3650
        });

        const columns = await getScanLogColumns();

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="aurascan-logs.csv"');
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('X-Content-Type-Options', 'nosniff');

        const { client, stream } = await streamScanLogs({ limit, days });

        // The pool caps at 10 clients, so a leaked client here wedges the whole app.
        let released = false;
        const release = (err) => {
            if (!released) {
                released = true;
                client.release(err);
            }
        };
        res.on('close', () => {
            if (!res.writableEnded) stream.destroy();
            release();
        });

        // alwaysWriteHeaders so a zero-row export is still a valid header-only CSV.
        const csvStream = format({ headers: columns, alwaysWriteHeaders: true, rowDelimiter: '\r\n' })
            .transform((row) => columns.map((c) => sanitizeCsvValues(row[c])));

        stream.on('error', (err) => {
            console.error(`[Export] stream failed for request ${req.requestId}:`, err.message);
            release(err);
            // Past the first byte the status is already sent, so destroy the response
            // rather than let the client mistake a truncated CSV for a complete one.
            if (res.headersSent) {
                res.destroy(err);
            } else {
                next(err);
            }
        });
        csvStream.on('end', release);

        stream.pipe(csvStream).pipe(res);
    } catch (err) {
        if (err.status === 400) {
            return res.status(400).json({
                error: err.message,
                requestId: req.requestId
            });
        }
        next(err);
    }
}

module.exports = { exportLogsCsv };
