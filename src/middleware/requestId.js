const crypto = require('crypto');

module.exports = (req, res, next) => {
    req.requestId = crypto.randomUUID();
    req.startTime = Date.now();
    res.setHeader('X-Request-ID', req.requestId);
    next();
};