function sanitizeCsvValues(value) {
    if (value === null || value === undefined) return '';
    if (value instanceof Date) return value.toISOString();
    if (Buffer.isBuffer(value)) return value.toString('base64');
    if (typeof value === 'object') return JSON.stringify(value);

    const str = String(value);

    // Spreadsheet formula injection: user_agent / referer / isp / quote_served are
    // attacker-controlled, and Excel/Sheets evaluate cells starting with these.
    if (/^[=+\-@\t\r]/.test(str)) return `'${str}`;
    return str;
}

module.exports = { sanitizeCsvValues };
