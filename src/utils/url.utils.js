const env = require('../config/env');

function validateTargetUrl(rawUrl) {
    if (!rawUrl) {
        throw new Error('URL parameter is required');
    }
    let parsed;
    try {
        parsed = new URL(rawUrl);
    } catch {
        throw new Error('Malformed destination URL');
    }

    if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Only HTTP and HTTPS URLs are permitted');
    }

    if (env.ENFORCE_ALLOWLIST) {
        if (parsed.host !== env.ALLOWED_HOST) {
            throw new Error('Target destination host is not in the allowlist');
        }
    }

    return parsed.toString();
}

module.exports = { validateTargetUrl };